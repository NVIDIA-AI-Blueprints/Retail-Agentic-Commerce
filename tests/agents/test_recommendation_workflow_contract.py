from pathlib import Path


def _read(path: str) -> str:
    return Path(path).read_text(encoding="utf-8")


def test_recommendation_workflow_uses_llm_first_parallel_arag() -> None:
    config_text = _read("src/agents/configs/recommendation.yml")

    assert (
        "tool_list: [rag_retriever, parallel_analysis, context_summary_agent, "
        "item_ranker_agent, output_contract_guard]" in config_text
    )
    assert "tool_list: [user_understanding_agent, nli_agent]" in config_text
    assert "_type: output_contract_guard" in config_text
    assert "top_k: 6" in config_text
    assert "Evaluate only the first 6 candidates by input order." in config_text

    for legacy_component in (
        "_type: nli_scorer",
        "_type: context_synthesizer",
        "_type: recommendation_compiler",
    ):
        assert legacy_component not in config_text


def test_register_exposes_only_non_semantic_custom_components() -> None:
    register_text = _read("src/agents/register.py")

    assert 'name="parallel_executor"' in register_text
    assert 'name="rag_retriever"' in register_text
    assert 'name="output_contract_guard"' in register_text
    assert "price_range_viewed" not in register_text
    assert "description_max_chars = 64" in register_text

    for legacy_component in (
        'name="nli_scorer"',
        'name="context_synthesizer"',
        'name="recommendation_compiler"',
    ):
        assert legacy_component not in register_text
