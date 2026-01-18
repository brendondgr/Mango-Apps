## Part 1: Automated Topic Creation via Agent

The goal of this implementation is to enable the creation of Topics directly from the app using a multi-agent system powered by Perplexity and Gemini APIs.

### 1. Overview

The system will take a user inquiry, plan the topic structure, research content using Perplexity, summarize it using Gemini, generate interactive visualizations, and compile everything into the standard Topic file structure.

### 2. Implementation Details

#### A. API Key Management

- **Requirement**: Securely store and access `PERPLEXITY_API_KEY` and `GEMINI_API_KEY`.
- **Implementation**:
  - Add a UI component (e.g., in a Settings modal) to input these keys.
  - Save them to a `.env` file in the project root.
  - Use `python-dotenv` to load these keys into the application environment at runtime.

#### B. The Agent Workflow

The process is divided into 4 sequential stages:

**Stage 1: Planning (The Architect)**

- **Input**: User Inquiry (e.g., "Explain Neural Networks").
- **Model**: `gemini-3-flash-preview`.
- **Action**: Analyze the request to determine necessary content and visualizations.
- **Output**: JSON object matching `@docs/json/example_initial.json`:
  - `name`: Topic Title.
  - `description`: Brief summary.
  - `folder`: Directory slug.
  - `question`: A detailed search query optimized for Perplexity.
  - `visualizations`: A list of strings describing needed visualizations.

**Stage 2: Research (The Researcher)**

- **Input**: `question` from Stage 1.
- **Model**: Perplexity Search API.
- **Action**: execution of a web search to gather up-to-date information.
- **Output**: Raw JSON search results (citations, snippets).
- **Fallback**: If Search API is insufficient, use Perplexity Grounded API (`sonar`).

**Stage 3: Content Generation (The Writer & Coder)**

- **Step 3a: Summarization**:
  - **Input**: Search results from Stage 2.
  - **Model**: `gemini-3-flash-preview`.
  - **Action**: Synthesize search results into educational Markdown content with LaTeX support.
- **Step 3b: Visualization**:
  - **Input**: Visualization descriptions from Stage 1.
  - **Model**: `gemini-3-flash-preview`.
  - **Action**: Generate a single HTML file for each visualization.
  - **Output**: HTML content + JSON metadata (`file_name`) as per `@docs/json/visualization.json`.
  - **Constraint**: Must strictly follow `docs/topic_create.md` styling (Vibrant UI, specific colors) and be mobile-responsive.

**Stage 4: Compilation (The Publisher)**

- **Input**: Generated Markdown, HTML files, and Metadata.
- **Action**:
  - Create the topic directory: `apps/<Subject>/<Topic>/`.
  - Write `info.json`.
  - Write `<topic>.md`, ensuring visualizations are embedded via `<iframe>` tags.
  - Save generated HTML files.

#### C. Testing & Verification

- **File**: `test_api.ipynb`
- **Purpose**: To verify each step of the pipeline in isolation before full integration.
- **Procedure**:
  1.  **Environment Check**: Verify API keys are loaded.
  2.  **Plan Test**: Send a dummy inquiry, validate JSON output.
  3.  **Search Test**: Send the generated question to Perplexity, validate response format.
  4.  **Gen Consideration**: Feed dummy search results to Gemini, check Markdown output.
  5.  **Vis Test**: Request a simple visualization, check if the HTML renders validly.

### 3. Constraints & Rules

- **Models**: STRICTLY `gemini-3-flash-preview` and `sonar`. No Pro models.
- **File Structure**: Must adhere to `docs/topic_create.md`.
- **Icons**: Assume `icon.svg` is provided/handled separately (or use a placeholder), do not generate SVGs via API.
