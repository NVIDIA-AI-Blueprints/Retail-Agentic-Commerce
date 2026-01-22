# NVIDIA NeMo Agent Toolkit - Comprehensive Documentation

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Architecture](#architecture)
4. [Building Agents](#building-agents)
5. [Tool Calling](#tool-calling)
6. [RAG (Retrieval Augmented Generation)](#rag-retrieval-augmented-generation)
7. [MCP (Model Context Protocol)](#mcp-model-context-protocol)
8. [Observability](#observability)
9. [Evaluations](#evaluations)
10. [Optimization](#optimization)
11. [CLI Reference](#cli-reference)
12. [Configuration Reference](#configuration-reference)
13. [Examples](#examples)

---

## Overview

NVIDIA NeMo Agent Toolkit (`nvidia-nat`) is a flexible, lightweight, and unifying library for building enterprise-grade AI agents. It provides:

- **Framework Agnostic Design**: Works with LangChain, LlamaIndex, CrewAI, Microsoft Semantic Kernel, Google ADK, and more
- **Reusable Components**: Every agent, tool, and workflow exists as composable function calls
- **Configuration-Driven**: YAML-based workflow definitions with full type validation
- **Enterprise Features**: Built-in profiling, observability, evaluation, and optimization
- **Protocol Support**: Full MCP (Model Context Protocol) and A2A (Agent-to-Agent) support

### Key Features

| Feature | Description |
|---------|-------------|
| Multi-Framework Support | LangChain, LlamaIndex, CrewAI, Semantic Kernel, Google ADK, Strands, AutoGen, Haystack |
| LLM Providers | NVIDIA NIM, OpenAI, Azure OpenAI, AWS Bedrock, HuggingFace, LiteLLM |
| Agent Types | ReAct, ReWOO, Tool-Calling, Router, Sequential Executor, Auto Memory Wrapper |
| Observability | Phoenix, Weave, Langfuse, OpenTelemetry, Galileo, Dynatrace |
| Evaluation | RAGAS metrics, Trajectory evaluation, SWE-Bench, Custom evaluators |
| Memory Systems | Redis, Mem0, Zep Cloud |
| Storage Backends | S3, MySQL, MinIO |

### Version Information

- **Package Name**: `nvidia-nat`
- **Python Support**: 3.11, 3.12, 3.13
- **License**: Apache-2.0

---

## Installation

### Quick Install (Package)

```bash
# Basic installation
pip install nvidia-nat

# With specific framework integrations
pip install "nvidia-nat[langchain]"
pip install "nvidia-nat[mcp]"
pip install "nvidia-nat[phoenix]"

# All optional dependencies
pip install "nvidia-nat[all]"
```

### Install from Source

```bash
# Clone the repository
git clone -b main https://github.com/NVIDIA/NeMo-Agent-Toolkit.git nemo-agent-toolkit
cd nemo-agent-toolkit

# Initialize submodules
git submodule update --init --recursive

# Fetch LFS files (datasets)
git lfs install
git lfs fetch
git lfs pull

# Create virtual environment with uv
uv venv --python 3.13 --seed .venv
source .venv/bin/activate

# Install with all dependencies
uv sync --all-groups --all-extras

# Or minimal install
uv sync
```

### Available Optional Extras

| Extra | Description |
|-------|-------------|
| `langchain` | LangChain/LangGraph support |
| `llama-index` | LlamaIndex integration |
| `crewai` | CrewAI multi-agent framework |
| `semantic-kernel` | Microsoft Semantic Kernel |
| `adk` | Google ADK |
| `strands` | Strands Agents |
| `autogen` | Microsoft AutoGen |
| `mcp` | Model Context Protocol |
| `phoenix` | Arize Phoenix observability |
| `weave` | Weights & Biases Weave |
| `opentelemetry` | OpenTelemetry support |
| `redis` | Redis memory backend |
| `profiling` | Performance profiling tools |
| `telemetry` | All telemetry packages |
| `all` | All optional dependencies |

### Verify Installation

```bash
nat --help
nat --version
```

---

## Architecture

### Project Structure

```
NeMo-Agent-Toolkit/
├── src/nat/                    # Core framework
│   ├── agent/                  # Agent implementations (ReAct, ReWOO, etc.)
│   ├── builder/                # Workflow construction engine
│   ├── tool/                   # Tool/Function management
│   ├── llm/                    # LLM provider integrations
│   ├── runtime/                # Workflow execution engine
│   ├── data_models/            # Configuration schemas
│   ├── cli/                    # Command-line interface
│   ├── observability/          # Monitoring & tracing
│   ├── profiler/               # Performance analysis
│   ├── eval/                   # Evaluation system
│   ├── memory/                 # Memory management
│   ├── retriever/              # RAG & document search
│   ├── embedder/               # Embedding models
│   ├── middleware/             # Request/Response processing
│   └── front_ends/             # API interfaces (FastAPI)
├── packages/                   # Optional plugins (29 packages)
├── examples/                   # Use case demonstrations
└── docs/                       # Documentation
```

### Core Components

1. **Builder**: Constructs workflows from configuration
2. **Runner**: Executes workflows with state management
3. **Functions**: Type-safe, async operations (tools and agents)
4. **LLMs**: Provider-agnostic LLM interface
5. **Retrievers**: RAG document retrieval
6. **Observability**: Telemetry and tracing

---

## Building Agents

### Configuration-Based Workflow (YAML)

The primary way to build agents is through YAML configuration files:

```yaml
# workflow.yml
functions:
  wikipedia_search:
    _type: wiki_search
    max_results: 2

llms:
  nim_llm:
    _type: nim
    model_name: meta/llama-3.1-70b-instruct
    temperature: 0.0
    max_tokens: 1024

workflow:
  _type: react_agent
  tool_names: [wikipedia_search]
  llm_name: nim_llm
  verbose: true
  parse_agent_response_max_retries: 3
```

### Running a Workflow

```bash
# Set your API key
export NVIDIA_API_KEY=<your_api_key>

# Run with CLI
nat run --config_file workflow.yml --input "What is LangChain?"

# Serve as API
nat serve --config_file workflow.yml
```

### Agent Types

#### 1. ReAct Agent (Reasoning + Acting)

```yaml
workflow:
  _type: react_agent
  tool_names: [search, calculator]
  llm_name: nim_llm
  verbose: true
  parse_agent_response_max_retries: 3
```

The ReAct agent follows the Thought → Action → Observation loop pattern.

#### 2. ReWOO Agent (Reasoning Without Observation)

```yaml
workflow:
  _type: rewoo_agent
  tool_names: [search, calculator]
  llm_name: nim_llm
  planner_llm_name: nim_llm
```

Creates an execution plan upfront before running tools.

#### 3. Tool-Calling Agent

```yaml
workflow:
  _type: tool_calling_agent
  tool_names: [calculator, datetime]
  llm_name: nim_llm
```

Uses native LLM function calling capabilities.

#### 4. Router Agent

```yaml
workflow:
  _type: router_agent
  routes:
    - name: math_route
      workflow: math_agent
      description: "Handle math questions"
    - name: search_route
      workflow: search_agent
      description: "Handle search queries"
  llm_name: nim_llm
```

Routes requests to specialized sub-agents.

#### 5. Sequential Executor

```yaml
workflow:
  _type: sequential_executor
  steps:
    - tool_name: data_fetcher
    - tool_name: processor
    - tool_name: formatter
```

Executes tools in a defined sequence.

### LLM Configuration

```yaml
llms:
  # NVIDIA NIM
  nim_llm:
    _type: nim
    model_name: meta/llama-3.1-70b-instruct
    temperature: 0.0
    max_tokens: 1024
    base_url: https://integrate.api.nvidia.com/v1  # Optional, for local NIM

  # OpenAI
  openai_llm:
    _type: openai
    model_name: gpt-4
    temperature: 0.7

  # Azure OpenAI
  azure_llm:
    _type: azure_openai
    model_name: gpt-4
    deployment_name: my-deployment
    api_version: "2024-02-15-preview"

  # AWS Bedrock
  bedrock_llm:
    _type: aws_bedrock
    model_id: anthropic.claude-3-sonnet-20240229-v1:0
```

---

## Tool Calling

### Built-in Functions

List available functions:

```bash
nat info components -t function
```

Common built-in functions:

| Function | Type | Description |
|----------|------|-------------|
| Wikipedia Search | `wiki_search` | Search Wikipedia |
| Current DateTime | `current_datetime` | Get current date/time |
| Calculator | `calculator` | Math operations |
| Code Generation | `code_generation` | Generate code |
| Document Search | `document_search` | Search documents |
| Retriever Tool | `nat_retriever` | RAG retrieval |

### Configuring Functions

```yaml
functions:
  # Wikipedia search tool
  wikipedia_search:
    _type: wiki_search
    max_results: 3

  # DateTime tool
  current_datetime:
    _type: current_datetime

  # Code generation tool
  code_generation:
    _type: code_generation
    programming_language: "Python"
    description: "Generate Python code"
    llm_name: nim_llm
    verbose: true
```

### Function Groups

Group related functions together:

```yaml
function_groups:
  calculator:
    _type: calculator
    # Provides: add, subtract, multiply, divide, compare

  math_tools:
    _type: math_tools
    # Multiple math-related functions
```

Reference in workflow:

```yaml
workflow:
  _type: react_agent
  tool_names: [calculator, current_datetime]
  llm_name: nim_llm
```

### Creating Custom Functions

```python
from pydantic import BaseModel, Field
from nat.tool.register import register_function
from nat.builder import Builder
from nat.data_models.function import FunctionBaseConfig

class MyToolConfig(FunctionBaseConfig, name="my_tool"):
    """Configuration for my custom tool."""
    param1: str = Field(description="First parameter")
    param2: int = Field(default=10, description="Second parameter")

class MyToolInput(BaseModel):
    """Input schema for the tool."""
    query: str = Field(description="The input query")

class MyToolOutput(BaseModel):
    """Output schema for the tool."""
    result: str = Field(description="The result")

@register_function(config_type=MyToolConfig)
async def my_tool(config: MyToolConfig, builder: Builder):
    """My custom tool implementation."""

    async def _invoke(input_data: MyToolInput) -> MyToolOutput:
        # Your tool logic here
        result = f"Processed: {input_data.query} with {config.param1}"
        return MyToolOutput(result=result)

    return _invoke
```

Use in configuration:

```yaml
functions:
  my_custom_tool:
    _type: my_tool
    param1: "hello"
    param2: 20
```

---

## RAG (Retrieval Augmented Generation)

### Overview

RAG enables LLMs to search data stores for semantically similar content to use as context.

### Retriever Configuration

#### Milvus Retriever

```yaml
retrievers:
  cuda_docs_retriever:
    _type: milvus_retriever
    uri: http://localhost:19530
    collection_name: "cuda_docs"
    embedding_model: milvus_embedder
    top_k: 10
    content_field: "text"
    vector_field: "embedding"

embedders:
  milvus_embedder:
    _type: nim
    model_name: nvidia/nv-embedqa-e5-v5
    truncate: "END"
```

#### NVIDIA NeMo Retriever

```yaml
retrievers:
  nemo_retriever:
    _type: nemo_retriever
    uri: http://localhost:8000
    collection_name: "my_collection"
    top_k: 10
    timeout: 60
```

### Using Retrievers as Tools

```yaml
retrievers:
  doc_retriever:
    _type: milvus_retriever
    uri: http://localhost:19530
    collection_name: "documents"
    embedding_model: embedder
    top_k: 5

functions:
  doc_search:
    _type: nat_retriever
    retriever: doc_retriever
    topic: "Search internal documentation"
    description: "Search company documentation for relevant information"

workflow:
  _type: react_agent
  tool_names: [doc_search]
  llm_name: nim_llm
```

### Complete RAG Example

```yaml
# RAG workflow configuration
retrievers:
  cuda_retriever:
    _type: milvus_retriever
    uri: http://localhost:19530
    collection_name: "cuda_docs"
    embedding_model: milvus_embedder
    top_k: 10

  mcp_retriever:
    _type: milvus_retriever
    uri: http://localhost:19530
    collection_name: "mcp_docs"
    embedding_model: milvus_embedder
    top_k: 10

functions:
  cuda_search:
    _type: nat_retriever
    retriever: cuda_retriever
    topic: "NVIDIA CUDA documentation"

  mcp_search:
    _type: nat_retriever
    retriever: mcp_retriever
    topic: "Model Context Protocol information"

embedders:
  milvus_embedder:
    _type: nim
    model_name: nvidia/nv-embedqa-e5-v5
    truncate: "END"

llms:
  nim_llm:
    _type: nim
    model_name: meta/llama-3.3-70b-instruct
    temperature: 0
    max_tokens: 4096

workflow:
  _type: react_agent
  tool_names: [cuda_search, mcp_search]
  llm_name: nim_llm
  verbose: true
```

### Retriever in Custom Functions

```python
@register_function(config_type=MyRAGConfig)
async def my_rag_function(config: MyRAGConfig, builder: Builder):
    # Get retriever instance
    retriever = await builder.get_retriever(config.retriever)

    # Or get LangChain-compatible retriever
    from nat.builder.llm import LLMFrameworkEnum
    langchain_retriever = await builder.get_retriever(
        config.retriever,
        wrapper_type=LLMFrameworkEnum.LANGCHAIN
    )

    async def _invoke(query: str):
        results = await retriever.search(query)
        return results

    return _invoke
```

---

## MCP (Model Context Protocol)

### Overview

MCP is an open protocol that standardizes how applications provide context to LLMs. NeMo Agent Toolkit supports both MCP client and server modes.

### Installation

```bash
pip install "nvidia-nat[mcp]"
```

### MCP Client Configuration

Connect to remote MCP servers and use their tools:

```yaml
function_groups:
  # Streamable HTTP transport (recommended)
  remote_tools:
    _type: mcp_client
    server:
      transport: streamable-http
      url: "http://localhost:9901/mcp"
    include:
      - calculator__add
      - calculator__multiply
    tool_overrides:
      calculator__add:
        alias: "add_numbers"
        description: "Add two numbers together"

  # STDIO transport (for local processes)
  local_time:
    _type: mcp_client
    server:
      transport: stdio
      command: "python"
      args: ["-m", "mcp_server_time", "--local-timezone=America/Los_Angeles"]

  # SSE transport (legacy)
  sse_tools:
    _type: mcp_client
    server:
      transport: sse
      url: "http://localhost:8080/sse"

workflow:
  _type: react_agent
  tool_names: [remote_tools, local_time]
  llm_name: nim_llm
```

### MCP Client Options

| Option | Description | Default |
|--------|-------------|---------|
| `server.transport` | Transport type: `streamable-http`, `stdio`, `sse` | `streamable-http` |
| `server.url` | Server URL (for http/sse) | - |
| `server.command` | Command to run (for stdio) | - |
| `server.args` | Command arguments (for stdio) | - |
| `server.env` | Environment variables (for stdio) | - |
| `server.auth_provider` | Auth provider reference | - |
| `tool_call_timeout` | Tool call timeout in seconds | `60` |
| `reconnect_enabled` | Enable auto-reconnect | `true` |
| `max_sessions` | Max concurrent sessions | `100` |
| `include` | Tools to include | - |
| `exclude` | Tools to exclude | - |

### MCP Server Mode

Expose your NAT workflow as an MCP server:

```bash
# Start MCP server
nat mcp serve --config_file workflow.yml --port 9901
```

### MCP CLI Commands

```bash
# List tools from MCP server
nat mcp client tool list --url http://localhost:9901/mcp

# Get tool details
nat mcp client tool list --url http://localhost:9901/mcp --tool calculator__multiply

# Call a tool
nat mcp client tool call calculator__multiply \
  --url http://localhost:9901/mcp \
  --json-args '{"numbers": [2, 3, 4]}'

# Ping server
nat mcp client ping --url http://localhost:9901/mcp
```

### MCP with Authentication

```yaml
function_groups:
  protected_tools:
    _type: mcp_client
    server:
      transport: streamable-http
      url: "http://example.com/mcp"
      auth_provider: "mcp_oauth2"
    auth_flow_timeout: 300
```

---

## Observability

### Overview

NeMo Agent Toolkit provides a plugin-based observability system supporting multiple telemetry exporters simultaneously.

### Installation

```bash
# All telemetry packages
pip install "nvidia-nat[telemetry]"

# Specific providers
pip install "nvidia-nat[phoenix]"
pip install "nvidia-nat[weave]"
pip install "nvidia-nat[opentelemetry]"
```

### Supported Providers

| Provider | Features |
|----------|----------|
| Phoenix | Logging, Tracing |
| W&B Weave | Logging, Tracing, Redaction, Eval Metrics |
| Langfuse | Logging, Tracing |
| OpenTelemetry | Logging, Tracing |
| Galileo | Logging, Tracing |
| Dynatrace | Logging, Tracing |
| DBNL | Logging, Tracing |
| Catalyst | Logging, Tracing |
| File Export | Local file output |

### Configuration

```yaml
general:
  telemetry:
    logging:
      console:
        _type: console
        level: WARN
      file:
        _type: file
        path: ./.tmp/workflow.log
        level: DEBUG

    tracing:
      # Phoenix tracing
      phoenix:
        _type: phoenix
        project_name: "my-project"
        endpoint: "http://localhost:6006"

      # Weave tracing
      weave:
        _type: weave
        project: "my-weave-project"

      # File backup
      file_backup:
        _type: file
        path: ./.tmp/traces.json

# ... rest of workflow configuration
```

### Log Levels

- `DEBUG`: Detailed debugging information
- `INFO`: General workflow information
- `WARNING`: Potential issues
- `ERROR`: Errors affecting workflow
- `CRITICAL`: Severe issues preventing execution

### Phoenix Integration Example

```yaml
general:
  telemetry:
    tracing:
      phoenix:
        _type: phoenix
        project_name: "my-agent"
        endpoint: "http://localhost:6006"
        batch_size: 100
        flush_interval: 5

llms:
  nim_llm:
    _type: nim
    model_name: meta/llama-3.1-70b-instruct

workflow:
  _type: react_agent
  tool_names: [wikipedia_search]
  llm_name: nim_llm
```

### List Telemetry Plugins

```bash
# Logging plugins
nat info components -t logging

# Tracing plugins
nat info components -t tracing
```

### Event Architecture

The observability system uses:

1. **IntermediateStepManager**: Publishes workflow events to a reactive stream
2. **Event Stream**: Broadcasts events to subscribed exporters
3. **Asynchronous Processing**: Keeps observability off the hot path
4. **Exporter Types**:
   - Raw Exporters: Direct event processing
   - Span Exporters: Lifecycle management for distributed tracing
   - OpenTelemetry Exporters: OTLP-compatible services

---

## Evaluations

### Overview

Evaluation is the process of running workflows on test data and measuring quality using quantitative metrics.

### Installation

```bash
pip install "nvidia-nat[profiling]"
```

### Running Evaluations

```bash
nat eval --config_file eval_config.yml
```

### Evaluation Configuration

```yaml
llms:
  nim_llm:
    _type: nim
    model_name: meta/llama-3.1-70b-instruct
    temperature: 0.0

  nim_eval_llm:
    _type: nim
    model_name: meta/llama-3.1-70b-instruct
    max_tokens: 8  # For judge LLM

functions:
  wikipedia_search:
    _type: wiki_search
    max_results: 2

workflow:
  _type: react_agent
  tool_names: [wikipedia_search]
  llm_name: nim_llm

eval:
  general:
    output_dir: ./.tmp/eval_results/
    max_concurrency: 8
    dataset:
      _type: json
      file_path: data/test_dataset.json

  evaluators:
    accuracy:
      _type: ragas
      metric: AnswerAccuracy
      llm_name: nim_eval_llm

    groundedness:
      _type: ragas
      metric: ResponseGroundedness
      llm_name: nim_eval_llm

    relevance:
      _type: ragas
      metric: ContextRelevance
      llm_name: nim_eval_llm

    trajectory:
      _type: trajectory
      llm_name: nim_eval_llm
```

### Dataset Format

```json
[
  {
    "id": "1",
    "question": "What is LangSmith?",
    "answer": "LangSmith is a platform for LLM application development"
  },
  {
    "id": "2",
    "question": "How do I prototype with LangSmith?",
    "answer": "You can quickly experiment with prompts and model types"
  }
]
```

### Built-in Evaluators

| Evaluator | Type | Description |
|-----------|------|-------------|
| RAGAS AnswerAccuracy | `ragas` | Accuracy vs ground truth |
| RAGAS ContextRelevance | `ragas` | Context relevance to query |
| RAGAS ResponseGroundedness | `ragas` | Response grounding in context |
| Trajectory | `trajectory` | Agent trajectory evaluation |
| SWE-Bench | `swe_bench` | Software engineering benchmark |
| Tunable RAG | `tunable_rag_evaluator` | Customizable RAG evaluation |

### Evaluation Outputs

```
output_dir/
├── workflow_output.json          # Per-sample results
├── config_original.yml           # Original config
├── config_effective.yml          # Applied config
├── config_metadata.json          # Run metadata
├── accuracy_output.json          # Evaluator results
├── groundedness_output.json
├── relevance_output.json
└── trajectory_output.json
```

### Evaluation CLI Options

```bash
# Basic evaluation
nat eval --config_file config.yml

# Override configuration
nat eval --config_file config.yml \
  --override llms.nim_llm.temperature 0.7 \
  --override eval.general.max_concurrency 4

# Evaluate remote workflow
nat eval --config_file config.yml --endpoint http://localhost:8000

# Multiple repetitions
nat eval --config_file config.yml --reps 5

# Resume from previous run
nat eval --config_file config.yml --skip_completed_entries \
  --dataset .tmp/workflow_output.json

# Skip workflow, evaluate only
nat eval --config_file config.yml --skip_workflow \
  --dataset .tmp/workflow_output.json
```

### Visualizing with Weave

```yaml
general:
  telemetry:
    tracing:
      weave:
        _type: weave
        project: "nat-evaluation"

eval:
  general:
    workflow_alias: "experiment-v1"
    # ... rest of config
```

### Custom Evaluators

```python
from nat.eval.evaluator.base import BaseEvaluator
from nat.eval.evaluator.evaluator_model import EvalInputItem, EvalOutputItem
from pydantic import Field

class MyEvaluatorConfig(BaseEvaluatorConfig, name="my_evaluator"):
    threshold: float = Field(default=0.5)

@register_evaluator(config_type=MyEvaluatorConfig)
class MyEvaluator(BaseEvaluator):
    async def evaluate(self, item: EvalInputItem) -> EvalOutputItem:
        score = calculate_score(item.output_obj, item.expected_output_obj)
        return EvalOutputItem(
            id=item.id,
            score=score,
            reasoning={"details": "evaluation reasoning"}
        )
```

---

## Optimization

### Overview

The NeMo Agent Toolkit Optimizer automatically finds optimal parameters for workflows using:

- **Numeric Optimization**: Optuna for hyperparameters
- **Prompt Optimization**: Genetic Algorithm for prompts

### Running the Optimizer

```bash
nat optimize --config_file optimize_config.yml
```

### Optimizer Configuration

```yaml
llms:
  nim_llm:
    _type: nim
    model_name: meta/llama-3.1-70b-instruct
    temperature: 0.0
    # Enable optimization for these parameters
    optimizable_params: [temperature, top_p, max_tokens]
    search_space:
      temperature:
        low: 0.1
        high: 0.9
        step: 0.2
      top_p:
        low: 0.5
        high: 1.0
        step: 0.1
      max_tokens:
        low: 128
        high: 2048
        step: 256

workflow:
  _type: react_agent
  tool_names: [calculator]
  llm_name: nim_llm

eval:
  general:
    output_dir: ./.tmp/optimize/
    dataset:
      _type: json
      file_path: data/test.json
  evaluators:
    accuracy:
      _type: ragas
      metric: AnswerAccuracy
      llm_name: nim_llm

optimizer:
  output_path: "optimizer_results"

  # Numeric optimization (Optuna)
  numeric:
    enabled: true
    n_trials: 50
    sampler: bayesian  # or "grid"

  # Prompt optimization (Genetic Algorithm)
  prompt:
    enabled: false
    ga_population_size: 16
    ga_generations: 8
    ga_crossover_rate: 0.7
    ga_mutation_rate: 0.2
    ga_elitism: 2
    ga_selection_method: "tournament"
    ga_tournament_size: 3

  # Evaluation settings
  reps_per_param_set: 3
  multi_objective_combination_mode: harmonic  # or "sum", "chebyshev"

  eval_metrics:
    latency:
      evaluator_name: "latency"
      direction: "minimize"
      weight: 0.2
    accuracy:
      evaluator_name: "accuracy"
      direction: "maximize"
      weight: 0.8
```

### Search Space Types

```yaml
# Continuous numerical
search_space:
  temperature:
    low: 0.1
    high: 0.9
    step: 0.1

# Categorical
search_space:
  model_name:
    values: ["gpt-3.5-turbo", "gpt-4", "llama-3.1-70b"]

# Prompt optimization
search_space:
  system_prompt:
    is_prompt: true
    prompt: "You are a helpful assistant."
    prompt_purpose: "Guide the chatbot behavior"
```

### Optimizer Outputs

```
optimizer_results/
├── optimized_config.yml           # Best configuration
├── trials_dataframe_params.csv    # All trial results
├── pareto_front_2d.png           # 2D Pareto visualization
├── pareto_parallel_coordinates.png
├── pareto_pairwise_matrix.png
└── optimized_prompts.json        # Best prompts (if enabled)
```

### Multi-Objective Optimization

| Mode | Description |
|------|-------------|
| `harmonic` | Balanced, penalizes poor metrics |
| `sum` | Simple weighted sum |
| `chebyshev` | Minimizes worst-case deviation |

---

## CLI Reference

### Main Commands

```bash
# Run workflow
nat run --config_file config.yml --input "Your query"

# Serve as API
nat serve --config_file config.yml --port 8000

# Evaluate workflow
nat eval --config_file config.yml

# Optimize workflow
nat optimize --config_file config.yml

# Validate configuration
nat validate --config_file config.yml

# Get component info
nat info components -t function
nat info components -t llm
nat info components -t evaluator
nat info components -t function_group -q mcp_client

# Start MCP server
nat mcp serve --config_file config.yml
```

### Common Options

```bash
# Override configuration values
--override llms.nim_llm.temperature 0.5
--override workflow.verbose true

# Specify dataset
--dataset data/test.json

# Set output directory
--output_dir ./.tmp/results/

# Verbose output
--verbose
```

---

## Configuration Reference

### Complete Configuration Template

```yaml
# General settings
general:
  telemetry:
    logging:
      console:
        _type: console
        level: INFO
    tracing:
      phoenix:
        _type: phoenix
        project_name: "my-project"

# LLM providers
llms:
  main_llm:
    _type: nim
    model_name: meta/llama-3.1-70b-instruct
    temperature: 0.0
    max_tokens: 1024
    top_p: 1.0

# Embedding models
embedders:
  embedder:
    _type: nim
    model_name: nvidia/nv-embedqa-e5-v5

# Retrievers for RAG
retrievers:
  doc_retriever:
    _type: milvus_retriever
    uri: http://localhost:19530
    collection_name: "documents"
    embedding_model: embedder
    top_k: 10

# Individual functions
functions:
  search:
    _type: wiki_search
    max_results: 3

  doc_search:
    _type: nat_retriever
    retriever: doc_retriever
    topic: "Search documents"

# Function groups
function_groups:
  calculator:
    _type: calculator

  mcp_tools:
    _type: mcp_client
    server:
      transport: streamable-http
      url: "http://localhost:9901/mcp"

# Memory configuration
memory:
  redis_memory:
    _type: redis
    host: localhost
    port: 6379

# Main workflow
workflow:
  _type: react_agent
  tool_names: [search, doc_search, calculator]
  llm_name: main_llm
  verbose: true

# Evaluation configuration
eval:
  general:
    output_dir: ./.tmp/eval/
    max_concurrency: 8
    dataset:
      _type: json
      file_path: data/test.json
    profiler:
      compute_llm_metrics: true
      token_uniqueness_forecast: true
  evaluators:
    accuracy:
      _type: ragas
      metric: AnswerAccuracy
      llm_name: main_llm

# Optimizer configuration
optimizer:
  output_path: "optimizer_results"
  numeric:
    enabled: true
    n_trials: 50
  eval_metrics:
    accuracy:
      evaluator_name: "accuracy"
      direction: "maximize"
```

---

## Examples

### 1. Simple Calculator Agent

```yaml
function_groups:
  calculator:
    _type: calculator

functions:
  current_datetime:
    _type: current_datetime

llms:
  nim_llm:
    _type: nim
    model_name: meta/llama-3.1-70b-instruct
    temperature: 0.0
    max_tokens: 1024

workflow:
  _type: react_agent
  tool_names: [calculator, current_datetime]
  llm_name: nim_llm
  verbose: true
```

### 2. RAG Agent with Milvus

```yaml
retrievers:
  knowledge_base:
    _type: milvus_retriever
    uri: http://localhost:19530
    collection_name: "kb_docs"
    embedding_model: embedder
    top_k: 5

functions:
  kb_search:
    _type: nat_retriever
    retriever: knowledge_base
    topic: "Company knowledge base"

embedders:
  embedder:
    _type: nim
    model_name: nvidia/nv-embedqa-e5-v5

llms:
  nim_llm:
    _type: nim
    model_name: meta/llama-3.3-70b-instruct
    temperature: 0
    max_tokens: 2048

workflow:
  _type: react_agent
  tool_names: [kb_search]
  llm_name: nim_llm
```

### 3. MCP Client Workflow

```yaml
function_groups:
  remote_calculator:
    _type: mcp_client
    server:
      transport: streamable-http
      url: "http://localhost:9901/mcp"

  local_time:
    _type: mcp_client
    server:
      transport: stdio
      command: "python"
      args: ["-m", "mcp_server_time"]

llms:
  nim_llm:
    _type: nim
    model_name: meta/llama-3.1-70b-instruct

workflow:
  _type: react_agent
  tool_names: [remote_calculator, local_time]
  llm_name: nim_llm
```

### 4. Multi-Agent Router

```yaml
llms:
  nim_llm:
    _type: nim
    model_name: meta/llama-3.1-70b-instruct

functions:
  math_solver:
    _type: calculator

  web_search:
    _type: wiki_search
    max_results: 3

workflow:
  _type: router_agent
  llm_name: nim_llm
  routes:
    - name: math
      description: "Handle mathematical calculations"
      tools: [math_solver]
    - name: research
      description: "Search for information"
      tools: [web_search]
```

### 5. Evaluation with Profiling

```yaml
llms:
  nim_llm:
    _type: nim
    model_name: meta/llama-3.1-70b-instruct
    temperature: 0.0

  eval_llm:
    _type: nim
    model_name: meta/llama-3.1-70b-instruct
    max_tokens: 8

functions:
  search:
    _type: wiki_search
    max_results: 2

workflow:
  _type: react_agent
  tool_names: [search]
  llm_name: nim_llm

eval:
  general:
    output_dir: ./.tmp/eval_with_profiling/
    dataset:
      _type: json
      file_path: data/test.json
    profiler:
      compute_llm_metrics: true
      token_uniqueness_forecast: true
      workflow_runtime_forecast: true
      csv_exclude_io_text: true
      prompt_caching_prefixes:
        enable: true
        min_frequency: 0.1
      bottleneck_analysis:
        enable_nested_stack: true
      concurrency_spike_analysis:
        enable: true
        spike_threshold: 5

  evaluators:
    accuracy:
      _type: ragas
      metric: AnswerAccuracy
      llm_name: eval_llm
    groundedness:
      _type: ragas
      metric: ResponseGroundedness
      llm_name: eval_llm
    trajectory:
      _type: trajectory
      llm_name: eval_llm
```

---

## Additional Resources

- **Official Documentation**: https://docs.nvidia.com/nemo/agent-toolkit/latest/
- **GitHub Repository**: https://github.com/NVIDIA/NeMo-Agent-Toolkit
- **API Reference**: Available in the `docs/` directory
- **Examples**: See the `examples/` directory for 50+ working examples

### Getting Help

```bash
# CLI help
nat --help
nat run --help
nat eval --help

# Component information
nat info components -t function -q wiki_search
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `NVIDIA_API_KEY` | NVIDIA NIM API key |
| `OPENAI_API_KEY` | OpenAI API key |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API key |
| `AWS_ACCESS_KEY_ID` | AWS credentials |
| `AWS_SECRET_ACCESS_KEY` | AWS credentials |
| `NAT_SPAN_PREFIX` | Span attribute prefix (default: `nat`) |

---

## Real Example: Multi-Agent Finance System

This section documents a real-world multi-agent system built with NeMo Agent Toolkit (NAT) and Google ADK. The **L'Oréal Finance Multi-Agent System** demonstrates best practices for building enterprise-grade AI agents with custom tools, hierarchical agent orchestration, MCP integration, and full observability.

> **⚠️ Disclaimer**: This is a demonstration project with mock data for educational purposes only.

### Project Overview

The system implements a hierarchical multi-agent architecture:

```
┌──────────────────────────────────────────┐
│       Financial Coordinator Agent        │  ← Main orchestrator (GPT-4)
│         (workflow: _type: adk)           │
└──────────────────┬───────────────────────┘
                   │
        ┌──────────┼──────────┐
        │          │          │
        ▼          ▼          ▼
┌──────────────┐ ┌────────────┐ ┌──────────────────┐
│Budget Analyst│ │Revenue     │ │MCP Tools         │
│   Agent      │ │Analyst     │ │- Currency Conv   │
│  (Nemotron)  │ │Agent       │ │- Email Service   │
│              │ │(GPT-OSS)   │ │                  │
└──────┬───────┘ └─────┬──────┘ └──────────────────┘
       │               │
       ▼               ▼
┌──────────────┐ ┌─────────────┐
│Budget Tools  │ │Revenue Tools│
│- get_campaign│ │- get_revenue│
│- get_summary │ │  by_product │
└──────────────┘ └─────────────┘
        │              │
        └──────┬───────┘
               ▼
       ┌───────────────┐
       │SQLite Database│
       │financial_data │
       └───────────────┘
```

### Project Structure

```
loreal-finance-agents/
├── pyproject.toml              # Dependencies and NAT entry point
├── configs/
│   ├── config.yml              # Main workflow configuration
│   └── eval-config.yml         # Evaluation configuration
├── data/
│   ├── financial_data.db       # SQLite database
│   └── eval_data.json          # Evaluation dataset
├── scripts/
│   ├── init_db.py              # Database initialization
│   └── verify_setup.py         # Setup verification
└── src/
    └── loreal_finance/
        ├── __init__.py         # Package metadata
        ├── register.py         # Component registration for NAT
        ├── agents/
        │   ├── __init__.py
        │   ├── budget_analyst.py    # Budget specialist agent
        │   ├── revenue_analyst.py   # Revenue specialist agent
        │   └── coordinator.py       # Main coordinator (optional)
        └── tools/
            ├── __init__.py
            ├── database_tools.py    # NAT tool registrations
            └── db_manager.py        # Database connection & queries
```

*This documentation was generated from the NeMo Agent Toolkit source code and official documentation.*

---

## Building Custom NAT Applications: Deep Dive Guide

This section provides a comprehensive guide for building custom applications using NVIDIA NeMo Agent Toolkit (NAT), with detailed patterns for custom functions, Nemotron model integration, and MCP server deployment. This guide is designed to help Claude and developers understand the exact implementation patterns required.

### Project Architecture for Custom NAT Applications

A custom NAT application follows a specific structure that leverages Python's entry point system for plugin discovery:

```
my-nat-project/
├── pyproject.toml              # Package config with NAT plugin entry point
├── register.py                 # Custom function definitions (plugin module)
├── configs/
│   └── config.yml              # Workflow configuration
├── Dockerfile                  # Container deployment (optional)
├── docker-compose.yml          # Docker orchestration (optional)
└── docker-compose-nim.yml      # Local NIM deployment (optional)
```

### Step 1: Package Configuration (pyproject.toml)

The `pyproject.toml` file is critical as it registers your custom functions as a NAT plugin:

```toml
[build-system]
build-backend = "setuptools.build_meta"
requires = ["setuptools >= 64", "setuptools-scm>=8"]

[tool.setuptools]
packages = []
py-modules = ["register"]  # Your module containing custom functions

[project]
name = "my-nat-project"
dynamic = ["version"]
dependencies = [
    # Core NAT with required extras (langchain and mcp are commonly needed)
    "nvidia-nat[langchain,mcp] @ git+https://github.com/NVIDIA/NeMo-Agent-Toolkit.git@main",
    # Add any additional dependencies your tools need
    "requests>=2.25.0"
]
requires-python = ">=3.11,<3.14"
description = "My custom NAT application"

# CRITICAL: This entry point tells NAT where to find your custom functions
[project.entry-points."nat.plugins"]
my_nat_project = "register"  # Points to register.py module
```

**Key Points:**
- The `[project.entry-points."nat.plugins"]` section is mandatory for NAT to discover your custom functions
- The value (`"register"`) must match your Python module name exactly
- You can install NAT from a specific commit hash for version pinning

### Step 2: Custom Function Development (register.py)

Custom functions in NAT follow a specific pattern using the `@register_function` decorator and generator syntax:

#### Required Imports

```python
import logging
from pydantic import BaseModel, Field
from nat.builder.builder import Builder
from nat.builder.function_info import FunctionInfo
from nat.cli.register_workflow import register_function
from nat.data_models.function import FunctionBaseConfig

logger = logging.getLogger(__name__)
```

#### Input Schema Definition

Define Pydantic models for your function's input parameters. These schemas are used by the LLM to understand how to call your tool:

```python
class MyToolInput(BaseModel):
    """Input schema for my custom tool."""
    query: str = Field(
        description="The search query to process",
        examples=["example query 1", "example query 2"]  # Helps LLM understand expected inputs
    )
    limit: int = Field(
        default=10,
        description="Maximum number of results to return",
        ge=1,
        le=100
    )
    category: str = Field(
        description="Category to search within",
        examples=["electronics", "clothing", "books"]
    )
```

**Best Practices for Input Schemas:**
- Always provide clear `description` for each field
- Use `examples` to guide the LLM on expected values
- Set sensible defaults where appropriate
- Use Pydantic validators (`ge`, `le`, `min_length`, etc.) for constraints

#### Configuration Class Definition

Each function needs a configuration class that inherits from `FunctionBaseConfig`:

```python
class MyToolConfig(FunctionBaseConfig, name="my_tool"):
    """Configuration for my custom tool.

    The `name` parameter in the class definition determines the `_type`
    value used in the YAML configuration file.
    """
    # Add any configuration parameters your tool needs
    api_endpoint: str = Field(
        default="https://api.example.com",
        description="API endpoint for the service"
    )
    timeout: int = Field(
        default=30,
        description="Request timeout in seconds"
    )
```

**Key Points:**
- The `name="my_tool"` parameter becomes the `_type` value in YAML config
- Configuration parameters are set in YAML, not at runtime
- These are for static configuration, not per-call inputs

#### Function Implementation with Generator Pattern

NAT uses a generator pattern (`yield`) instead of `return` for function registration:

```python
@register_function(config_type=MyToolConfig)
async def my_tool(config: MyToolConfig, builder: Builder):
    """
    My custom tool implementation.

    This outer function receives configuration and builder.
    It must yield a FunctionInfo object.
    """

    # You can do setup work here that happens once when the tool is initialized
    # For example: initialize API clients, load resources, etc.
    api_client = SomeAPIClient(config.api_endpoint, timeout=config.timeout)

    async def _my_tool_impl(query: str, limit: int = 10, category: str = "") -> str:
        """
        Inner function that handles the actual tool execution.

        This function is called each time the LLM invokes the tool.
        Parameters must match the Input schema fields.
        Return type should be str for text output, or dict for structured data.
        """
        try:
            # Your tool logic here
            results = await api_client.search(query, limit=limit, category=category)

            # Format response for the LLM
            if not results:
                return f"No results found for '{query}' in category '{category}'."

            formatted_results = []
            for i, result in enumerate(results, 1):
                formatted_results.append(f"{i}. {result['name']} - ${result['price']}")

            return f"Found {len(results)} results for '{query}':\n" + "\n".join(formatted_results)

        except Exception as e:
            logger.error(f"Error in my_tool: {e}")
            return f"Error processing request: {str(e)}"

    # CRITICAL: Use yield with FunctionInfo.from_fn
    yield FunctionInfo.from_fn(
        _my_tool_impl,
        description=(
            "Detailed description of what this tool does. "
            "This description is shown to the LLM to help it decide when to use this tool. "
            "Be specific about capabilities and expected inputs."
        ),
        input_schema=MyToolInput
    )
```

**Why Generator Pattern (`yield`) Instead of `return`:**
1. Allows NAT to manage the function lifecycle
2. Enables lazy initialization of resources
3. Supports cleanup logic after the yield (though rarely needed)
4. Aligns with NAT's internal function registration mechanism

#### Complete Custom Function Example: Product Search

```python
class SearchProductInput(BaseModel):
    """Input schema for product search with specific parameters."""
    product: str = Field(
        description="Product type to search for",
        examples=["shirt", "pants", "shorts", "sunglasses", "jacket"]
    )
    size: str = Field(
        description="Size of the product",
        examples=["small", "medium", "large"]
    )
    color: str = Field(
        description="Color of the product",
        examples=["white", "black", "blue", "gray", "brown", "khaki", "navy", "gold"]
    )


class SearchProductConfig(FunctionBaseConfig, name="search_product"):
    """Configuration for product search tool."""
    pass  # No additional config needed for this simple tool


@register_function(config_type=SearchProductConfig)
async def search_product(config: SearchProductConfig, builder: Builder):
    """Product search tool that queries inventory."""

    async def _search_product(product: str, size: str, color: str) -> str:
        # Mock inventory data structure
        inventory = {
            "shirt": {
                "small": {
                    "white": {"available": True, "price": 25.99, "description": "Cotton crew neck shirt"},
                    "black": {"available": True, "price": 25.99, "description": "Cotton crew neck shirt"},
                },
                "medium": {
                    "white": {"available": True, "price": 27.99, "description": "Cotton crew neck shirt"},
                    "black": {"available": False, "price": 27.99, "description": "Cotton crew neck shirt"},
                },
            },
            # ... more products
        }

        # Normalize inputs
        product_lower = product.lower().strip()
        size_lower = size.lower().strip()
        color_lower = color.lower().strip()

        # Validation with helpful error messages
        if product_lower not in inventory:
            available_products = list(inventory.keys())
            return f"Sorry, '{product}' is not available. We have: {', '.join(available_products)}."

        if size_lower not in inventory[product_lower]:
            available_sizes = list(inventory[product_lower].keys())
            return f"Sorry, size '{size}' is not available for {product}. Available sizes: {', '.join(available_sizes)}."

        if color_lower not in inventory[product_lower][size_lower]:
            available_colors = list(inventory[product_lower][size_lower].keys())
            return f"Sorry, color '{color}' is not available for {size} {product}. Available colors: {', '.join(available_colors)}."

        # Return product information
        product_info = inventory[product_lower][size_lower][color_lower]

        if product_info["available"]:
            return (
                f"✅ Yes! We have a {size_lower} {color_lower} {product_lower} in stock.\n"
                f"Price: ${product_info['price']}\n"
                f"Description: {product_info['description']}"
            )
        else:
            available_colors = [c for c, info in inventory[product_lower][size_lower].items() if info['available']]
            return (
                f"❌ Sorry, the {size_lower} {color_lower} {product_lower} is currently out of stock.\n"
                f"Available colors for {size_lower} {product_lower}: {', '.join(available_colors)}"
            )

    yield FunctionInfo.from_fn(
        _search_product,
        description=(
            "Product search tool that searches through inventory to find clothing items. "
            "Takes three parameters: product type (shirt, pants, shorts, sunglasses, jacket), "
            "size (small, medium, large), and color. Returns availability, price, and description."
        ),
        input_schema=SearchProductInput
    )
```

#### Complete Custom Function Example: Weather API Integration

```python
import requests
from datetime import datetime, date, timedelta


class GetWeatherInput(BaseModel):
    """Input schema for weather queries."""
    city: str = Field(
        description="Name of the city to get weather for",
        examples=["New York", "London", "Tokyo", "San Francisco"]
    )
    target_date: str = Field(
        description="Date for weather forecast in YYYY-MM-DD format",
        examples=["2024-01-15", "2024-12-25", "2025-03-10"]
    )


class GetWeatherConfig(FunctionBaseConfig, name="get_weather"):
    """Configuration for weather tool."""
    pass


@register_function(config_type=GetWeatherConfig)
async def get_weather(config: GetWeatherConfig, builder: Builder):
    """Weather tool that fetches real weather data from Open-Meteo API."""

    async def _get_weather(city: str, target_date: str) -> dict:
        """
        Return daily weather for a city and date in Fahrenheit.
        target_date format: YYYY-MM-DD
        """
        # Parse and validate date
        try:
            d = datetime.strptime(target_date, "%Y-%m-%d").date()
        except ValueError:
            return {"error": "Invalid date format. Use YYYY-MM-DD."}

        # Geocode city using Open-Meteo's geocoding API
        try:
            g = requests.get(
                "https://geocoding-api.open-meteo.com/v1/search",
                params={"name": city, "count": 1, "language": "en", "format": "json"},
                timeout=10,
            ).json()
            if not g.get("results"):
                return {"error": "City not found."}
            loc = g["results"][0]
            lat, lon = loc["latitude"], loc["longitude"]
            resolved = f'{loc.get("name")}, {loc.get("country")}'
        except Exception:
            return {"error": "Geocoding request failed."}

        # Determine appropriate API endpoint based on date
        today = date.today()
        if d < today:
            endpoint = "https://archive-api.open-meteo.com/v1/archive"
        elif d <= today + timedelta(days=16):
            endpoint = "https://api.open-meteo.com/v1/forecast"
        else:
            return {"error": "Forecast available only up to 16 days ahead."}

        # Build API request
        daily_vars = ",".join([
            "weathercode", "temperature_2m_max", "temperature_2m_min",
            "apparent_temperature_max", "apparent_temperature_min",
            "precipitation_sum", "rain_sum", "snowfall_sum", "windspeed_10m_max",
        ])
        params = {
            "latitude": lat, "longitude": lon,
            "start_date": d.isoformat(), "end_date": d.isoformat(),
            "daily": daily_vars, "timezone": "auto",
            "temperature_unit": "fahrenheit",
            "windspeed_unit": "mph",
            "precipitation_unit": "inch",
        }

        try:
            r = requests.get(endpoint, params=params, timeout=20)
            r.raise_for_status()
            data = r.json().get("daily", {})
        except Exception:
            return {"error": "Weather request failed."}

        if not data.get("time") or data["time"][0] != d.isoformat():
            return {"error": "No data for the requested date."}

        def v(key):
            arr = data.get(key, [])
            return arr[0] if arr else None

        return {
            "city_requested": city,
            "city_resolved": resolved,
            "date": d.isoformat(),
            "units": {"temperature": "fahrenheit", "wind": "mph", "precipitation": "inch"},
            "weather": {
                "code": v("weathercode"),
                "temp_max": v("temperature_2m_max"),
                "temp_min": v("temperature_2m_min"),
                "apparent_temp_max": v("apparent_temperature_max"),
                "apparent_temp_min": v("apparent_temperature_min"),
                "precipitation_sum": v("precipitation_sum"),
                "rain_sum": v("rain_sum"),
                "snowfall_sum": v("snowfall_sum"),
                "wind_10m_max": v("windspeed_10m_max"),
            }
        }

    yield FunctionInfo.from_fn(
        _get_weather,
        description=(
            "Weather tool that provides current or forecast weather information for any city. "
            "Takes a city name and target date (YYYY-MM-DD format). "
            "Returns detailed weather data in Fahrenheit including temperature, precipitation, and wind."
        ),
        input_schema=GetWeatherInput
    )
```

### Step 3: Workflow Configuration with Nemotron Models

The `config.yml` file defines your workflow, LLM configuration, and how functions are orchestrated:

#### Basic Configuration Structure

```yaml
# General settings
general:
  use_uvloop: true  # Enables faster async event loop

# Register your custom functions
functions:
  search_product:
    _type: search_product  # Matches the `name` in FunctionBaseConfig
    description: "Searches for clothing items in inventory"

  get_weather:
    _type: get_weather
    description: "Gets weather information for any city"

  # Built-in NAT function
  current_datetime:
    _type: current_datetime
    description: "Returns the current date and time"

# LLM Configuration
llms:
  nim_llm:
    _type: nim
    model_name: nvidia/nvidia-nemotron-nano-9b-v2
    temperature: 0.1
    max_tokens: 2048

# Workflow definition
workflow:
  description: "Description shown to users about what this agent does"
  _type: react_agent
  workflow_alias: my_agent  # Name used when exposing as MCP tool
  tool_names:
    - search_product
    - get_weather
    - current_datetime
  llm_name: nim_llm
  parse_agent_response_max_retries: 5
  verbose: true
  system_prompt: |
    You are a helpful assistant with access to the following tools:
    {tools}

    Use this format for your responses:

    Question: the user's question
    Thought: analyze what information you need
    Action: one of [{tool_names}]
    Action Input: JSON object with parameters
    Observation: the result

    ... (repeat as needed)

    Thought: I have all the information needed
    Final Answer: your response to the user

    Guidelines:
    - Always check tool availability before recommending
    - Provide helpful suggestions when items are unavailable
```

### Step 4: Nemotron Model Configuration Deep Dive

NVIDIA Nemotron models are optimized for agentic workloads. Here's how to configure them:

#### Cloud-Hosted NIM (NVIDIA API)

```yaml
llms:
  nim_llm:
    _type: nim
    model_name: nvidia/nvidia-nemotron-nano-9b-v2  # or other Nemotron models
    temperature: 0.1  # Lower temperature for more deterministic tool calling
    max_tokens: 2048
    # Uses NVIDIA_API_KEY environment variable automatically
```

**Available Nemotron Models on NVIDIA NIM:**
- `nvidia/nvidia-nemotron-nano-9b-v2` - Compact, efficient model for tool calling
- `nvidia/nemotron-70b-instruct` - Larger model for complex reasoning
- `meta/llama-3.1-70b-instruct` - Alternative option with strong performance
- `meta/llama-3.3-70b-instruct` - Latest Llama model

#### Self-Hosted NIM (Local GPU)

```yaml
llms:
  local_llm:
    _type: nim
    model_name: nvidia/nvidia-nemotron-nano-9b-v2
    temperature: 0.1
    max_tokens: 2048
    base_url: http://nemotron:8000/v1  # Points to local NIM container
```

**Docker Compose for Local NIM:**

```yaml
# docker-compose-nim.yml
services:
  nemotron:
    image: nvcr.io/nim/nvidia/nvidia-nemotron-nano-9b-v2:1.12
    ports:
      - "8000:8000"
    environment:
      - NGC_API_KEY=${NGC_API_KEY}
    user: "${UID:-1000}"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              device_ids: ['0']
              capabilities: [gpu]
    restart: "no"
    networks:
      - my-network

networks:
  my-network:
    driver: bridge
```

#### Nemotron-Specific System Prompt Optimization

Nemotron models support a special `/no_think` directive to reduce verbose reasoning:

```yaml
workflow:
  system_prompt: |
    /no_think You are an intelligent assistant with access to tools.

    Available tools:
    {tools}

    Use this format:
    Question: the user's question
    Thought: brief analysis
    Action: tool name
    Action Input: {"param": "value"}
    Observation: result

    Thought: conclusion
    Final Answer: response
```

### Step 5: Deployment Patterns

#### Pattern A: Direct Workflow Execution (Development/Testing)

```bash
# Install the project
uv venv && source .venv/bin/activate
uv pip install -e .

# Set API key
export NVIDIA_API_KEY=<your_api_key>

# Run single query
nat run --config_file configs/config.yml --input "Your query here"

# Run with verbose output
nat run --config_file configs/config.yml --input "Your query" --verbose
```

#### Pattern B: MCP Server (Production Integration)

The MCP server exposes your workflow as tools that other AI systems can call:

```bash
# Start MCP server
nat mcp --config_file configs/config.yml --host 0.0.0.0 --port 9901 --tool_names my_agent
```

**MCP Server Dockerfile:**

```dockerfile
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PIP_NO_CACHE_DIR=1

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y \
    curl git build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install uv for fast dependency management
RUN pip install uv

# Copy project files
COPY pyproject.toml ./
COPY register.py ./
COPY configs/ ./configs/

# Install project and dependencies
RUN uv pip install --system -e .

# Create non-root user for security
RUN useradd --create-home --shell /bin/bash app \
    && chown -R app:app /app
USER app

EXPOSE 9901

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:9901/health || exit 1

# Start MCP server
ENTRYPOINT ["nat", "mcp", "--config_file", "configs/config.yml", "--host", "0.0.0.0", "--port", "9901", "--tool_names", "my_agent"]
```

**Docker Compose with Nginx Reverse Proxy:**

```yaml
version: '3.8'

services:
  my-nat-mcp:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: my-nat-mcp
    ports:
      - "9901:9901"
    environment:
      - PYTHONUNBUFFERED=1
      - NAT_LOG_LEVEL=INFO
      - NVIDIA_API_KEY=${NVIDIA_API_KEY}
    volumes:
      - ./configs:/app/configs:ro
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9901/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - my-network

  nginx:
    image: nginx:alpine
    container_name: my-nginx
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - my-nat-mcp
    restart: unless-stopped
    networks:
      - my-network

networks:
  my-network:
    driver: bridge
```

#### Pattern C: FastAPI HTTP Server

```bash
# Start as HTTP API server
nat serve --config_file configs/config.yml --port 8000
```

### Step 6: Testing and Debugging

#### Local Testing Commands

```bash
# Test a single query
nat run --config_file configs/config.yml --input "Do you have small white shirts?"

# Test with complex multi-step query
nat run --config_file configs/config.yml --input "I have a trip to Miami next weekend, what outfit do you recommend in size large?"

# List available components
nat info components -t function
nat info components -t llm
```

#### MCP Client Testing

```bash
# List available tools from MCP server
nat mcp client tool list --url http://localhost:9901/mcp

# Call a specific tool
nat mcp client tool call my_agent \
  --url http://localhost:9901/mcp \
  --json-args '{"input": "Do you have medium black jackets?"}'

# Ping server health
nat mcp client ping --url http://localhost:9901/mcp
```

### Step 7: Advanced Patterns

#### Using Builder to Access Other NAT Components

The `builder` parameter gives access to other configured components:

```python
@register_function(config_type=MyAdvancedToolConfig)
async def my_advanced_tool(config: MyAdvancedToolConfig, builder: Builder):

    # Access another LLM for sub-tasks
    sub_llm = await builder.get_llm(config.sub_llm_name)

    # Access a retriever for RAG
    retriever = await builder.get_retriever(config.retriever_name)

    # Access LangChain-wrapped retriever
    from nat.builder.llm import LLMFrameworkEnum
    langchain_retriever = await builder.get_retriever(
        config.retriever_name,
        wrapper_type=LLMFrameworkEnum.LANGCHAIN
    )

    async def _impl(query: str) -> str:
        # Use retrieved context
        docs = await retriever.search(query)

        # Use sub-LLM for processing
        response = await sub_llm.generate(f"Based on: {docs}\nAnswer: {query}")

        return response

    yield FunctionInfo.from_fn(_impl, description="...", input_schema=MyInput)
```

#### Multi-Agent Configuration

```yaml
llms:
  coordinator_llm:
    _type: nim
    model_name: meta/llama-3.3-70b-instruct
    temperature: 0.0
    max_tokens: 2048

  specialist_llm:
    _type: nim
    model_name: nvidia/nvidia-nemotron-nano-9b-v2
    temperature: 0.1
    max_tokens: 1024

functions:
  product_search:
    _type: search_product

  weather_lookup:
    _type: get_weather

# Router agent that delegates to specialists
workflow:
  _type: router_agent
  llm_name: coordinator_llm
  routes:
    - name: shopping
      description: "Handle product searches and inventory queries"
      tools: [product_search]
    - name: weather
      description: "Handle weather-related queries"
      tools: [weather_lookup]
```

### Common Patterns and Best Practices

#### 1. Input Validation Pattern

Always validate inputs early and return helpful error messages:

```python
async def _my_tool(param: str) -> str:
    # Normalize input
    param_normalized = param.lower().strip()

    # Validate against known values
    valid_values = ["option1", "option2", "option3"]
    if param_normalized not in valid_values:
        return f"Invalid value '{param}'. Valid options are: {', '.join(valid_values)}"

    # Process valid input
    return f"Processed: {param_normalized}"
```

#### 2. External API Integration Pattern

```python
@register_function(config_type=APIToolConfig)
async def api_tool(config: APIToolConfig, builder: Builder):

    # Initialize API client once during setup
    import httpx
    client = httpx.AsyncClient(
        base_url=config.api_base_url,
        timeout=config.timeout,
        headers={"Authorization": f"Bearer {config.api_key}"}
    )

    async def _call_api(query: str) -> dict:
        try:
            response = await client.get("/search", params={"q": query})
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            logger.error(f"API error: {e}")
            return {"error": f"API request failed: {str(e)}"}

    yield FunctionInfo.from_fn(_call_api, description="...", input_schema=MyInput)
```

#### 3. Structured Output Pattern

Return structured data for complex responses:

```python
async def _search_products(query: str) -> str:
    results = do_search(query)

    # Format as readable string for LLM
    if not results:
        return "No products found matching your search."

    output_lines = [f"Found {len(results)} products:"]
    for i, product in enumerate(results, 1):
        output_lines.append(
            f"{i}. {product['name']}\n"
            f"   Price: ${product['price']:.2f}\n"
            f"   Status: {'In Stock' if product['available'] else 'Out of Stock'}"
        )

    return "\n".join(output_lines)
```

#### 4. Error Handling Best Practices

```python
async def _robust_tool(param: str) -> str:
    try:
        result = await perform_operation(param)
        return format_success(result)
    except ValidationError as e:
        # Return user-friendly validation error
        return f"Invalid input: {e.message}"
    except ExternalServiceError as e:
        # Log error, return graceful fallback
        logger.error(f"External service error: {e}")
        return "Service temporarily unavailable. Please try again later."
    except Exception as e:
        # Catch-all with logging
        logger.exception(f"Unexpected error in tool: {e}")
        return f"An unexpected error occurred: {str(e)}"
```

### Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `NVIDIA_API_KEY` | API key for NVIDIA NIM cloud | Yes (for cloud NIM) |
| `NGC_API_KEY` | API key for NGC container registry | Yes (for local NIM) |
| `NAT_LOG_LEVEL` | Logging level (DEBUG, INFO, WARN, ERROR) | No |
| `NAT_SPAN_PREFIX` | Prefix for telemetry spans | No |

### Quick Reference: Creating a New Custom Function

1. **Define Input Schema** (Pydantic BaseModel with Field descriptions)
2. **Define Config Class** (inherits `FunctionBaseConfig`, set `name` parameter)
3. **Implement Function** (async, takes config and builder, yields FunctionInfo)
4. **Register in YAML** (under `functions:` with matching `_type`)
5. **Add to Workflow** (in `tool_names` list)
6. **Test** with `nat run`

This pattern ensures your custom functions integrate seamlessly with NAT's framework-agnostic architecture and work with any supported LLM provider including Nemotron models.
