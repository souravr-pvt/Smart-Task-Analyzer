# Smart-Task-Analyzer
This project is a client-side version of the Smart Task Analyzer, built using HTML, CSS, and JavaScript.
It analyzes tasks, calculates priority scores, and displays them in a sorted, user-friendly format.

Project Overview
The Smart Task Analyzer is a mini-application that scores and ranks tasks based on:
Urgency (how near the deadline is)
Importance (1–10 user rating)
Effort Required (estimated hours)
Dependencies (tasks blocked by this task)
Although the assignment was designed for a backend API using Django, this solution implements the entire logic in pure JavaScript, without a backend.

Features
Add tasks with:
Title
Due date
Estimated hours
Importance
Dependencies

Analyze Tasks:
The JavaScript scoring algorithm evaluates every task and sorts them by priority.

Multiple priority modes:
Fastest Wins
High Impact
Deadline Driven
Smart Balance (custom weighted scoring)

Visual output:
Sorted task list
Priority score
Priority color indicators
Explanations for each score

Algorithm Explanation

The Task Analyzer uses a weighted scoring system implemented in JavaScript to calculate the priority of each task. The goal is to rank tasks in a way that balances urgency, importance, effort, and dependencies.

1. Urgency

Urgency is based on the number of days left before the due date:

Tasks past their due date get maximum urgency score.

Tasks with closer deadlines get a higher urgency weight.

Distant tasks receive a lower urgency score.

2. Importance

Importance is a direct user-given rating (1–10).
This value is multiplied by a weight to ensure highly impactful tasks score higher.

3. Effort

Effort works inversely:

Low-hour tasks get a bonus (quick wins).

High-hour tasks get a reduced score, since they require more time.

4. Dependencies

Tasks that are blocking other tasks are considered more critical.
Each dependency increases the score, rewarding tasks that unlock progress elsewhere


Why this algorithm works:-

This system balances short-term urgency with long-term importance.
It also rewards low-effort wins while ensuring tasks that unblock others get priority.
This combination creates a practical real-world task ranking model.

 Design Decisions:-

Used pure JavaScript instead of Python/Django because the scoring logic can run on the client side without a backend.

Chose event-driven JS for responsiveness and simplicity.

Made UI minimal and fast without external libraries.

Used color-coded badges to help users understand priority visually.

Future Improvements:-

Add Django or Node.js backend

Add user accounts & authentication

Add graphs / visualization of urgency & dependencies

Add drag-and-drop task editing

Add localStorage / database for saving tasks permanently
