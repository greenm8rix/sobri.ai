# Sobri.ai - Your Companion for Sobriety

Sobri.ai is a comprehensive application designed to support individuals on their path to sobriety. It offers a suite of tools to encourage mindfulness, track progress, provide support, and help users build and maintain a sober lifestyle.

## Core Purpose

The primary goal of Sobri.ai is to be a constant companion and a source of strength for users navigating the challenges and triumphs of sobriety. It aims to empower users by providing accessible tools for self-reflection, motivation, and connection.

## Key Features (High-Level)

Based on the application's components, Sobri.ai appears to offer the following key functionalities:

*   **AI-Powered Chat Support (`ChatView`):** An interactive chatbot that can offer immediate support, answer questions, provide encouragement, or guide users through difficult moments. This is a core interactive element of the app.
*   **Journaling (`JournalView`):** A private space for users to record their thoughts, feelings, experiences, and reflections. Journaling is a powerful tool for self-awareness and emotional processing during recovery.
*   **Progress Tracking (`ProgressView`):** Allows users to monitor their sobriety milestones, streaks, and other relevant metrics. Visualizing progress can be highly motivating.
*   **Personalized Insights (`InsightsView`):** The application may analyze user data (e.g., journal entries, chat interactions - with user consent) to provide personalized insights, identify patterns, or offer relevant suggestions to support their journey.
*   **Task Management (`TasksView`):** Helps users set and track goals or tasks related to their sobriety, such as attending meetings, practicing mindfulness, or engaging in healthy habits.
*   **Resource Hub (`ResourcesView`):** A curated collection of helpful articles, links, coping strategies, or contact information for support groups and professional help.
*   **Regular Check-ins (`CheckInView`):** Prompts for users to check in with their emotional state or progress, fostering a routine of self-assessment.
*   **Memory Aid (`MemoryView`):** feature to help users recall past insights, motivations, or positive memories that reinforce their commitment to sobriety.
*   **User Feedback System:** As we've discussed, the app includes a system to gather user feedback at key milestones (e.g., after a certain number of chat messages) to continuously improve the application. This feedback is intended to be sent to a support team via an email.

## Technical Overview (Brief)

*   **Frontend (`project/` directory):** This is the user-facing part of the application, likely built with a modern web technology like React. It handles the user interface, interactions, and presents the features listed above.
*   **Backend (Supabase Edge Functions in `supabase/functions/`):** Server-side logic is handled by Supabase Edge Functions. This includes tasks like:
    *   Sending feedback emails (`send-feedback-email`).
    *   Managing potential subscriptions or payments (e.g., `stripe-checkout`, `stripe-webhook`).
    *   Securely interacting with the database.

Sobri.ai aims to be a user-friendly and supportive tool, leveraging technology to make the journey of sobriety more manageable and empowering. 