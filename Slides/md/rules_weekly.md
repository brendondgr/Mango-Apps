# Slide Rules Overview
## Description
Rules for writing markdown document for bi-weekly presentations. 

## Structure
It should have a defined structure, specifically two sections:
1. Overview of everything done throughout the week
2. Breakdown of Overview into Powerpoint Slides

### 1. Overview
Structured by giving bulleted points of what was done each week, specifying what was done, if it was done successfully, and various pitfalls along the way. Ask user for more details if something is unclear or lacks information.

Example:
```md
- Implemented user authentication module: Successfully integrated with existing database, but faced challenges with password hashing which required switching to bcrypt library.
- Developed API endpoints for data retrieval: Completed on time, but discovered performance issues under high load that need optimization.
- Set up CI/CD pipeline: Configured successfully, however, initial dependency conflicts were resolved by updating package versions.
```

### 2. Powerpoint Slides
Putting everything from Overview into a set-up to create a powerpoint. It should have breakdown points for each slide.

Rules for creating PowerPoint slides:
- Slide 1: Welcome slide titled "Team Meeting" with a brief welcome message.
- Slide 2: "Weekly Overview" with a numbered list of high-level accomplishments from the Overview section.
- Slides 3+: Detailed slides for each major task, breaking down successes and challenges.
- Final slide: "Goals for Next Week" with bullet points for upcoming objectives.

### Rules for Generating Content:
- **First Person**: Always write from my perspective (e.g., "I developed," "My research").
- **Minimalism**: Focus on visual impacts and minimal word counts. Use concise bullet points; avoid being overly verbose or using long sentences.
- **Clean Structure**: Maintain a logical, easy-to-follow flow with distinct headers and consistent formatting.

Example:
```md
## Slide 1: Team Meeting
- Welcome to the bi-weekly team update

## Slide 2: Weekly Overview
1. Implemented user authentication module
2. Developed API endpoints for data retrieval
3. Set up CI/CD pipeline

## Slide 3: User Authentication Implementation
- Successfully integrated user authentication module with existing database
- Faced challenges with password hashing, resolved by switching to bcrypt library

## Slide 4: API Endpoints Development
- Developed API endpoints for data retrieval, completed on time
- Discovered performance issues under high load requiring optimization

## Slide 5: CI/CD Pipeline Setup
- Configured CI/CD pipeline successfully
- Resolved initial dependency conflicts by updating package versions

## Slide 6: Goals for Next Week
- Optimize API performance under high load
- Implement additional security features for user authentication
- Expand CI/CD pipeline to include automated testing
```