# Quickstart

> Generate an API key and make your first call in < 3 minutes.

## Generating an API Key

<Card title="Get your Perplexity API Key" icon="key" arrow="True" horizontal="True" iconType="solid" cta="Click here" href="https://perplexity.ai/account/api">
  Navigate to the **API Keys** tab in the API Portal and generate a new key.
</Card>

<Info>
  See the [API Groups](/getting-started/api-groups) page to set up an API group.
</Info>

<Note>
  **OpenAI SDK Compatible:** Perplexity's API supports the OpenAI Chat Completions format. You can use OpenAI client libraries by pointing to our endpoint. See our [OpenAI SDK Guide](/guides/chat-completions-guide) for examples.
</Note>

## Making Your First API Call

<Tabs>
  <Tab title="Python SDK">
    <Note>
      **Install the SDK first:** `pip install perplexityai`
    </Note>

    <CodeGroup>
      ```python Non-streaming Request theme={null}
      from perplexity import Perplexity

      # Initialize the client (uses PERPLEXITY_API_KEY environment variable)
      client = Perplexity()

      # Make the API call
      completion = client.chat.completions.create(
          model="sonar-pro",
          messages=[
              {"role": "user", "content": "What were the results of the 2025 French Open Finals?"}
          ]
      )

      # Print the AI's response
      print(completion.choices[0].message.content)
      ```

      ```python Streaming Response theme={null}
      from perplexity import Perplexity

      # Initialize the client (uses PERPLEXITY_API_KEY environment variable)
      client = Perplexity()

      # Make the streaming API call
      stream = client.chat.completions.create(
          model="sonar-pro",
          messages=[
              {"role": "user", "content": "What are the most popular open-source alternatives to OpenAI's GPT models?"}
          ],
          stream=True
      )

      # Process the streaming response
      for chunk in stream:
          if chunk.choices[0].delta.content:
              print(chunk.choices[0].delta.content, end="")
      ```

      ```python With API Key (Alternative) theme={null}
      import os
      from perplexity import Perplexity

      # Initialize client with explicit API key
      client = Perplexity(api_key=os.environ.get("PERPLEXITY_API_KEY"))

      completion = client.chat.completions.create(
          model="sonar-pro",
          messages=[
              {"role": "user", "content": "What were the results of the 2025 French Open Finals?"}
          ]
      )

      print(completion.choices[0].message.content)
      ```
    </CodeGroup>

    <Note>
      Set your API key as an environment variable: `export PERPLEXITY_API_KEY="your_api_key_here"` (macOS/Linux) or `setx PERPLEXITY_API_KEY "your_api_key_here"` (Windows).
    </Note>

  </Tab>

  <Tab title="TypeScript SDK">
    <Note>
      **Install the SDK first:** `npm install @perplexity-ai/perplexity_ai`
    </Note>

    <CodeGroup>
      ```typescript Non-streaming Request theme={null}
      import Perplexity from '@perplexity-ai/perplexity_ai';

      // Initialize the client (uses PERPLEXITY_API_KEY environment variable)
      const client = new Perplexity();

      // Make the API call
      const completion = await client.chat.completions.create({
          model: "sonar-pro",
          messages: [
              { role: "user", content: "What were the results of the 2025 French Open Finals?" }
          ]
      });

      // Print the AI's response
      console.log(completion.choices[0].message.content);
      ```

      ```typescript Streaming Response theme={null}
      import Perplexity from '@perplexity-ai/perplexity_ai';

      // Initialize the client (uses PERPLEXITY_API_KEY environment variable)
      const client = new Perplexity();

      // Make the streaming API call
      const stream = await client.chat.completions.create({
          model: "sonar-pro",
          messages: [
              { role: "user", content: "What are the most popular open-source alternatives to OpenAI's GPT models?" }
          ],
          stream: true
      });

      // Process the streaming response
      for await (const chunk of stream) {
          if (chunk.choices[0]?.delta?.content) {
              process.stdout.write(chunk.choices[0].delta.content);
          }
      }
      ```

      ```typescript With API Key (Alternative) theme={null}
      import Perplexity from '@perplexity-ai/perplexity_ai';

      // Initialize client with explicit API key
      const client = new Perplexity({
          apiKey: process.env.PERPLEXITY_API_KEY
      });

      const completion = await client.chat.completions.create({
          model: "sonar-pro",
          messages: [
              { role: "user", content: "What were the results of the 2025 French Open Finals?" }
          ]
      });

      console.log(completion.choices[0].message.content);
      ```
    </CodeGroup>

    <Note>
      Set your API key as an environment variable: `export PERPLEXITY_API_KEY="your_api_key_here"` (macOS/Linux) or `setx PERPLEXITY_API_KEY "your_api_key_here"` (Windows).
    </Note>

  </Tab>

  <Tab title="cURL">
    **cURL** is a command-line tool for making HTTP requests. Set your API key and run the command:

    <CodeGroup>
      ```bash Non-streaming Request theme={null}
      curl --location 'https://api.perplexity.ai/chat/completions' \
      --header 'accept: application/json' \
      --header 'content-type: application/json' \
      --header "Authorization: Bearer $SONAR_API_KEY" \
      --data '{
        "model": "sonar-pro",
        "messages": [
          {
            "role": "user",
            "content": "What were the results of the 2025 French Open Finals?"
          }
        ]
      }' | jq
      ```

      ```bash Streaming Response theme={null}
      curl https://api.perplexity.ai/chat/completions \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $SONAR_API_KEY" \
      -d '{
      "model": "sonar-pro",
      "messages": [
      {
        "role": "user",
        "content": "What were the results of the 2025 French Open Finals?"
      }
      ],
      "stream": true
      }'| jq
      ```
    </CodeGroup>

  </Tab>
</Tabs>

<Accordion title="Here's an example response (raw response at the end)">
  ## Response Content

```
## 2025 French Open Finals Results

**Men's Singles Final**

- **Champion:** Carlos Alcaraz
- **Runner-up:** Jannik Sinner
- **Score:** 4–6, 6–7^(4–7), 6–4, 7–6^(7–3), 7–6^(10–2)
- **Details:** Carlos Alcaraz successfully defended his title by defeating Jannik Sinner in a dramatic five-set final. The match lasted 5 hours and 29 minutes, making it the longest French Open final in history and the second-longest major final ever. Alcaraz came back from two sets down and saved three championship points, marking a historic comeback. This victory gave Alcaraz his second French Open and fifth Grand Slam title, making him the second-youngest man to win five majors in the Open Era. It was also the first time a French Open singles final was decided by a final-set tiebreak.[1][2]

**Women's Singles Final**

- **Champion:** Coco Gauff
- **Runner-up:** Aryna Sabalenka
- **Score:** (Set scores not fully provided, but Gauff won in three sets)
- **Details:** Coco Gauff rallied from an early deficit to defeat Aryna Sabalenka in a three-set battle. After losing the first set, Gauff fought back to claim her second Grand Slam title, with both coming against Sabalenka (the first being the 2023 US Open). Gauff’s victory marks her first French Open crown at age 21.[5]

**Women's Doubles Final**

- **Champions:** Anna Danilina / Aleksandra Krunić
- **Runners-up:** Sara Errani / (partner not fully specified)
- **Score:** 4–6, 6–1, 6–1
- **Details:** Danilina and Krunić won the women's doubles final in three sets, taking control after dropping the first set.[3]

**Summary Table**

| Event                  | Winner                                | Runner-up                        | Score                                         |
|------------------------|---------------------------------------|----------------------------------|-----------------------------------------------|
| Men's Singles          | Carlos Alcaraz                        | Jannik Sinner                    | 4–6, 6–7(4–7), 6–4, 7–6(7–3), 7–6(10–2)       |
| Women's Singles        | Coco Gauff                            | Aryna Sabalenka                  | Gauff won in 3 sets (full scores not given)   |
| Women's Doubles        | Anna Danilina / Aleksandra Krunić     | Sara Errani / (unspecified)      | 4–6, 6–1, 6–1                                 |

Alcaraz's men's final win was both historic for its comeback and duration, and Gauff’s victory marked a defining moment in her early career.[1][2][5]
```

## Search Results

```json theme={null}
[
  "https://en.wikipedia.org/wiki/2025_French_Open_%E2%80%93_Men's_singles",
  "https://en.wikipedia.org/wiki/2025_French_Open_%E2%80%93_Men's_singles_final",
  "https://www.rolandgarros.com/en-us/matches?status=finished",
  "https://www.tennis.com/news/articles/who-were-the-winners-and-losers-at-2025-roland-garros",
  "https://www.cbssports.com/tennis/news/2025-french-open-results-schedule-as-jannik-sinner-faces-carlos-alcaraz-coco-gauff-earns-first-title/"
]
```

## Sample Search Results (first 2 sources)

```json theme={null}
[
  {
    "title": "2025 French Open – Men's singles final",
    "url": "https://en.wikipedia.org/wiki/2025_French_Open_%E2%80%93_Men's_singles_final",
    "date": "2025-06-08",
    "last_updated": "2025-08-09",
    "snippet": "After 5 hours and 29 minutes of play, Alcaraz defeated Sinner 4–6, 6–7 (4–7) , 6–4, 7–6 (7–3) , 7–6 (10–2) , in the longest French Open final in history."
  },
  {
    "title": "2025 Roland Garros Men's Singles Tennis Live Scores - ESPN",
    "url": "https://www.espn.com/tennis/scoreboard/tournament/_/eventId/172-2025/competitionType/1",
    "date": "2025-06-08",
    "last_updated": "2025-08-29",
    "snippet": "2025 Roland Garros Scores May 18 - June 8, 2025 Court Philippe-Chatrier, Paris, France Men's Singles 2025 Carlos Alcaraz Defending Champion Carlos Alcaraz."
  }
]
```

## Usage Information

```json theme={null}
{
  "prompt_tokens": 12,
  "completion_tokens": 315,
  "total_tokens": 327,
  "search_context_size": "low",
  "cost": {
    "input_tokens_cost": 0.0,
    "output_tokens_cost": 0.005,
    "request_cost": 0.006,
    "total_cost": 0.011
  }
}
```

## Raw Response

```json expandable theme={null}
{
  "id": "66f3900f-e32e-4d59-b677-1a55de188262",
  "model": "sonar-pro",
  "created": 1756485272,
  "usage": {
    "prompt_tokens": 12,
    "completion_tokens": 315,
    "total_tokens": 327,
    "search_context_size": "low",
    "cost": {
      "input_tokens_cost": 0.0,
      "output_tokens_cost": 0.005,
      "request_cost": 0.006,
      "total_cost": 0.011
    }
  },
  "citations": [
    "https://en.wikipedia.org/wiki/2025_French_Open_%E2%80%93_Men's_singles_final",
    "https://www.espn.com/tennis/scoreboard/tournament/_/eventId/172-2025/competitionType/1",
    "https://www.cbssports.com/tennis/news/2025-french-open-results-schedule-as-jannik-sinner-faces-carlos-alcaraz-coco-gauff-earns-first-title/",
    "https://www.youtube.com/watch?v=jrkwqoI-gEg",
    "https://en.wikipedia.org/wiki/2025_French_Open_%E2%80%93_Men's_singles"
  ],
  "search_results": [
    {
      "title": "2025 French Open – Men's singles final",
      "url": "https://en.wikipedia.org/wiki/2025_French_Open_%E2%80%93_Men's_singles_final",
      "date": "2025-06-08",
      "last_updated": "2025-08-09",
      "snippet": "After 5 hours and 29 minutes of play, Alcaraz defeated Sinner 4–6, 6–7 (4–7) , 6–4, 7–6 (7–3) , 7–6 (10–2) , in the longest French Open final in history."
    },
    {
      "title": "2025 Roland Garros Men's Singles Tennis Live Scores - ESPN",
      "url": "https://www.espn.com/tennis/scoreboard/tournament/_/eventId/172-2025/competitionType/1",
      "date": "2025-06-08",
      "last_updated": "2025-08-29",
      "snippet": "2025 Roland Garros Scores May 18 - June 8, 2025 Court Philippe-Chatrier, Paris, France Men's Singles 2025 Carlos Alcaraz Defending Champion Carlos Alcaraz."
    },
    {
      "title": "2025 French Open: Results, schedule as Jannik Sinner ...",
      "url": "https://www.cbssports.com/tennis/news/2025-french-open-results-schedule-as-jannik-sinner-faces-carlos-alcaraz-coco-gauff-earns-first-title/",
      "date": "2025-06-07",
      "last_updated": "2025-08-29",
      "snippet": "The women's final is on June 7, and the men's final is one day later on June 8. Men's final. (1) Jannik Sinner vs. (2) Carlos Alcaraz -- Sunday, ..."
    },
    {
      "title": "Alcaraz, Gauff Win French Open 2025 | Swiatek, Ruud Fall - YouTube",
      "url": "https://www.youtube.com/watch?v=jrkwqoI-gEg",
      "date": "2025-06-09",
      "last_updated": "2025-08-04",
      "snippet": "We had some big changes in the rankings also. What was your favorite moment? 0:00 | Intro 0:14 | Weekly Results 0:36 | Rise & Fall 1:24 ..."
    },
    {
      "title": "2025 French Open – Men's singles",
      "url": "https://en.wikipedia.org/wiki/2025_French_Open_%E2%80%93_Men's_singles",
      "date": "2025-04-27",
      "last_updated": "2025-08-29",
      "snippet": "Defending champion Carlos Alcaraz defeated Jannik Sinner in the final, 4–6, 6–7, 6–4, 7–6, 7–6 to win the men's singles tennis title at the 2025 French Open. ..."
    }
  ],
  "object": "chat.completion",
  "choices": [
    {
      "index": 0,
      "finish_reason": "stop",
      "message": {
        "role": "assistant",
        "content": "**Carlos Alcaraz won the 2025 French Open men's singles final, defeating Jannik Sinner 4–6, 6–7(4–7), 6–4, 7–6(7–3), 7–6(10–2), while Coco Gauff won the women's singles title by rallying past Aryna Sabalenka in three sets**[1][3][5][4].\n\nKey details from the finals:\n\n- **Men's Singles:**  \n  - Alcaraz came back from two sets down to win in the longest French Open final ever (5 hours, 29 minutes)[1][5].\n  - He saved three championship points, a record in the Open Era for men's majors[1][5].\n  - This marked his second Roland Garros title and fifth Grand Slam overall[5].\n  - The match was the first French Open singles final decided by a match tiebreak (final set tiebreak introduced in 2022)[1][5].\n\n- **Women's Singles:**  \n  - Coco Gauff defeated Aryna Sabalenka after losing the first set, showcasing a strong comeback[3].\n  - Gauff secured her second Grand Slam (her first was at the 2023 US Open)[3].\n  - The final was played June 7, 2025; Gauff overcame an early deficit to win in three sets[3].\n\nThese finals were historic for their drama, length, and the milestone achievements for both Alcaraz and Gauff."
      },
      "delta": {
        "role": "assistant",
        "content": ""
      }
    }
  ]
}
```

</Accordion>

<Info title="Complete Streaming Guide" href="/guides/streaming-responses">
  For a full guide on streaming, including parsing, error handling, citation management, and best practices, see our [streaming guide](/guides/streaming-responses).
</Info>

## Next Steps

Now that you've made your first API call, here are some recommended next steps:

<CardGroup cols={2}>
  <Card title="The Perplexity SDK Guide" icon="book" href="/guides/perplexity-sdk">
    Learn how to use the official Perplexity SDK with type safety, async support, and advanced features.
  </Card>

  <Card title="Models" icon="brain" href="/getting-started/models">
    Explore the different models available and their capabilities.
  </Card>

  <Card title="API Reference" icon="code" href="/api-reference">
    View the complete API documentation with detailed endpoint specifications.
  </Card>

  <Card title="Examples" icon="play" href="/cookbook/index">
    Explore code examples, tutorials, and integration patterns.
  </Card>
</CardGroup>

<Info>
  Need help? Check out our [community](https://community.perplexity.ai) for support and discussions with other developers.
</Info>

---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://docs.perplexity.ai/llms.txt
