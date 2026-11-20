# SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0

"""Capture agent HTTP results and compare latency, outcomes, and contract checks."""

from __future__ import annotations

import argparse
import json
import math
import random
import statistics
import time
import urllib.error
import urllib.request
from collections import Counter
from datetime import UTC, datetime
from pathlib import Path
from typing import Any, cast

from src.data.product_catalog import PRODUCTS

PORTS = {
    "promotion": 8002,
    "post-purchase": 8003,
    "recommendation": 8004,
    "search": 8005,
}
DATASETS = Path(__file__).resolve().parents[1] / "data" / "eval"
CATALOG = {item["id"]: item["name"] for item in PRODUCTS}
DEMO = {
    "recommendation": {
        "query": "Recommend products that complement a Classic Tee",
        "cart_items": [
            {
                "product_id": "prod_1",
                "name": "Classic Tee",
                "category": "tops",
                "price": 2500,
            }
        ],
        "session_context": {"browse_history": ["casual wear", "jeans"]},
    },
    "search": {"query": "Classic Tee", "category": "tops", "limit": 3},
}
SEARCH_EXPECTED_IDS: dict[str, set[str]] = {
    "search_001": {"prod_17"},
    "search_003": {"prod_1", "prod_2", "prod_3", "prod_4"},
    "search_008": set(),
    "search_widget": {"prod_1"},
}


def requests_for(
    agent: str, dataset_dir: Path, replicates: int
) -> list[tuple[dict[str, Any], int]]:
    dataset = dataset_dir / f"{agent.replace('-', '_')}_eval.json"
    cases = json.loads(dataset.read_text(encoding="utf-8"))
    repeats = [cases[0]]
    if agent in DEMO:
        fixture = {
            "id": f"{agent}_widget",
            "question": json.dumps(DEMO[agent]),
            "answer": None,
        }
        cases.append(fixture)
        repeats.append(fixture)
    return [(case, 0) for case in cases] + [
        (case, rep) for rep in range(1, replicates + 1) for case in repeats
    ]


def capture(args: argparse.Namespace) -> None:
    with args.output.open("x", encoding="utf-8") as output:
        for agent in args.agents:
            url = f"http://127.0.0.1:{PORTS[agent] + args.port_offset}/generate"
            for case, repeat in requests_for(agent, args.dataset_dir, args.replicates):
                request = urllib.request.Request(
                    url,
                    data=json.dumps({"input_message": case["question"]}).encode(),
                    headers={"Content-Type": "application/json"},
                )
                started_at = datetime.now(UTC)
                started = time.perf_counter()
                status, error, body = None, None, None
                try:
                    with urllib.request.urlopen(
                        request, timeout=args.timeout
                    ) as response:
                        status = response.status
                        body = response.read().decode()
                except urllib.error.HTTPError as exc:
                    status = exc.code
                    body = exc.read().decode(errors="replace")
                except (OSError, TimeoutError) as exc:
                    error = f"{type(exc).__name__}: {exc}"
                elapsed = time.perf_counter() - started
                record = {
                    **case,
                    "lane": args.lane,
                    "agent": agent,
                    "repeat": repeat,
                    "started_at": started_at.isoformat(),
                    "elapsed_s": round(elapsed, 6),
                    "http": status,
                    "error": error,
                    "body": body,
                }
                output.write(json.dumps(record) + "\n")
                output.flush()
                print(
                    f"{args.lane} {agent} {case['id']} rep={repeat} "
                    f"HTTP={status} {elapsed:.2f}s",
                    flush=True,
                )
                time.sleep(args.cooldown)


def workflow_output(record: dict[str, Any]) -> dict[str, Any] | None:
    if record["http"] != 200:
        return None
    try:
        value = json.loads(json.loads(record["body"])["value"])
    except (KeyError, TypeError, ValueError):
        return None
    return cast(dict[str, Any], value) if isinstance(value, dict) else None


def checks(record: dict[str, Any]) -> dict[str, bool]:
    agent = record["agent"]
    question = json.loads(record["question"])
    result = workflow_output(record)
    values = result or {}
    metrics = {"json_response": result is not None}
    if agent == "promotion":
        expected = json.loads(record["answer"])
        metrics.update(
            eligible_decision=(
                values.get("product_id") == question["product_id"]
                and values.get("action") in question["allowed_actions"]
                and isinstance(values.get("reason_codes"), list)
                and bool(values.get("reasoning"))
            ),
            expected_action=values.get("action") == expected["action"],
        )
    elif agent == "post-purchase":
        brand = question["brand_persona"]
        order = question["order"]
        tracking = order.get("tracking_url")
        message = values.get("message")
        metrics["shipping_contract"] = (
            values.get("language") == brand["preferred_language"]
            and values.get("status") == question["status"]
            and values.get("order_id") == order["order_id"]
            and bool(values.get("subject"))
            and isinstance(message, str)
            and brand["company_name"] in message
            and (not tracking or tracking in message)
        )
    else:
        search = agent == "search"
        raw_items = values.get("results" if search else "recommendations")
        rows = cast(list[Any], raw_items) if isinstance(raw_items, list) else []
        items = [cast(dict[str, Any], item) for item in rows if isinstance(item, dict)]
        ids: list[str] = []
        for item in items:
            product_id = item.get("product_id")
            if (
                isinstance(product_id, str)
                and product_id in CATALOG
                and item.get("product_name") == CATALOG[product_id]
            ):
                ids.append(product_id)
        grounded = isinstance(raw_items, list) and len(ids) == len(rows)
        metrics.update(grounded=grounded, nonempty=bool(ids))
        if search:
            metrics["search_contract"] = (
                grounded
                and len(ids) == len(set(ids))
                and len(ids) <= question["limit"]
                and values.get("query") == question["query"]
            )
            if record["id"] in SEARCH_EXPECTED_IDS:
                expected_ids = SEARCH_EXPECTED_IDS[record["id"]]
                metrics["expected_catalog_match"] = grounded and (
                    bool(expected_ids.intersection(ids)) if expected_ids else not ids
                )
        else:
            cart_ids = {item["product_id"] for item in question["cart_items"]}
            trace = values.get("pipeline_trace")
            metrics["recommendation_contract"] = (
                grounded
                and not cart_ids.intersection(ids)
                and len(ids) == len(set(ids))
                and len(ids) <= 3
                and isinstance(trace, dict)
                and cast(dict[str, Any], trace).get("final_ranked") == len(ids)
                and [item.get("rank") for item in items] == list(range(1, len(ids) + 1))
            )
            if record["id"] == "recommendation_widget":
                metrics["widget_top_three"] = (
                    metrics["recommendation_contract"] and len(ids) == 3
                )
    return metrics


def read_records(paths: list[Path]) -> dict[tuple[str, str, int], dict[str, Any]]:
    records: dict[tuple[str, str, int], dict[str, Any]] = {}
    for path in paths:
        for line in path.read_text(encoding="utf-8").splitlines():
            record = json.loads(line)
            key = (record["agent"], record["id"], record["repeat"])
            if key in records:
                raise SystemExit(f"Duplicate request {key} in {path}")
            records[key] = record
    return records


def latency(samples: list[float]) -> dict[str, float | None]:
    if not samples:
        return {"p50": None, "p95": None}
    return {
        "p50": round(statistics.median(samples), 3),
        "p95": round(sorted(samples)[math.ceil(len(samples) * 0.95) - 1], 3),
    }


def summarize(records: list[dict[str, Any]]) -> dict[str, Any]:
    scores = [checks(record) for record in records]
    totals = Counter(name for score in scores for name in score)
    passed = Counter(name for score in scores for name, ok in score.items() if ok)
    return {
        "samples": len(records),
        "http": dict(Counter(str(record["http"]) for record in records)),
        "latency_s_all": latency([record["elapsed_s"] for record in records]),
        "latency_s_json": latency(
            [
                record["elapsed_s"]
                for record, score in zip(records, scores, strict=True)
                if score["json_response"]
            ]
        ),
        "checks": {
            name: {"passed": passed[name], "total": total}
            for name, total in totals.items()
        },
    }


def compare(args: argparse.Namespace) -> None:
    baseline = read_records(args.baseline)
    candidate = read_records(args.candidate)
    if baseline.keys() != candidate.keys() or any(
        baseline[key]["question"] != candidate[key]["question"] for key in baseline
    ):
        raise SystemExit("Artifacts contain different request cases or payloads.")
    report = {}
    for agent in PORTS:
        base = [record for key, record in baseline.items() if key[0] == agent]
        trial = [record for key, record in candidate.items() if key[0] == agent]
        if base:
            report[agent] = {"baseline": summarize(base), "candidate": summarize(trial)}
    print(json.dumps(report, indent=2))
    if args.review_dir is None:
        return
    args.review_dir.mkdir(parents=True, exist_ok=True)
    cards: list[dict[str, Any]] = []
    key_file: dict[str, dict[str, str]] = {}
    rng = random.Random(args.review_seed)
    for key in sorted(baseline):
        agent, case, repeat = key
        if repeat or agent == "promotion":
            continue
        a, b = baseline[key], candidate[key]
        if rng.getrandbits(1):
            a, b = b, a
        card_id = f"{agent}:{case}"
        cards.append(
            {
                "id": card_id,
                "agent": agent,
                "input": json.loads(a["question"]),
                "expected": a["answer"],
                "A": workflow_output(a),
                "B": workflow_output(b),
            }
        )
        key_file[card_id] = {"A": a["lane"], "B": b["lane"]}
    for name, data in (("review.json", cards), ("lane-key.json", key_file)):
        with (args.review_dir / name).open("x", encoding="utf-8") as file:
            json.dump(data, file, indent=2, ensure_ascii=False)
            file.write("\n")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_subparsers(dest="command", required=True)
    capture_parser = mode.add_parser("capture")
    capture_parser.add_argument("--lane", required=True)
    capture_parser.add_argument("--port-offset", type=int, default=0)
    capture_parser.add_argument("--dataset-dir", type=Path, default=DATASETS)
    capture_parser.add_argument("--output", type=Path, required=True)
    capture_parser.add_argument(
        "--agents", nargs="+", choices=PORTS, default=list(PORTS)
    )
    capture_parser.add_argument("--replicates", type=int, default=1)
    capture_parser.add_argument("--timeout", type=float, default=60)
    capture_parser.add_argument("--cooldown", type=float, default=0.4)
    capture_parser.set_defaults(run=capture)
    compare_parser = mode.add_parser("compare")
    compare_parser.add_argument("--baseline", nargs="+", type=Path, required=True)
    compare_parser.add_argument("--candidate", nargs="+", type=Path, required=True)
    compare_parser.add_argument("--review-dir", type=Path)
    compare_parser.add_argument("--review-seed", type=int, default=154)
    compare_parser.set_defaults(run=compare)
    args = parser.parse_args()
    args.run(args)


if __name__ == "__main__":
    main()
