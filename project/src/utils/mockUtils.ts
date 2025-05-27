// Simple mock of uuid function
export const v4 = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Welcome messages for the AI chat
export const getWelcomeMessage = (): string => {
  const welcomeMessages = [
    "Hi, I'm MyBoo, your recovery companion. I'm here to support you on your journey to a healthier life. How are you feeling today?",
    "Welcome back! I'm MyBoo, your recovery ally. I'm here to listen, support, and help you through both good days and challenging moments. What's on your mind?",
    "Hello! I'm MyBoo, and I'm dedicated to supporting your recovery journey. Whether you're having a good day or struggling, I'm here for you. How are you doing right now?"
  ];
  
  return welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
};

// Crisis response for users reporting extreme cravings or distress
export const getCrisisResponse = (craving: string): string => {
  const immediateStrategies = [
    "Take 5 deep breaths, inhaling for 4 counts and exhaling for 6. This activates your parasympathetic nervous system to reduce anxiety.",
    "Try the 5-4-3-2-1 grounding technique: Name 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste.",
    "Put your hands under cold water for 30 seconds or hold an ice cube. This physical sensation can interrupt craving patterns.",
    "Call or text someone you trust right now. Real human connection is powerful during intense cravings.",
    "Step outside for 5 minutes and focus only on nature or your surroundings. A change of environment can interrupt the craving cycle."
  ];
  
  const followUpSupport = [
    "Remember that cravings are temporary - they always pass, even when they feel overwhelming.",
    "Your brain is used to the substance and is sending signals, but you are stronger than these signals. They will weaken over time.",
    "This moment doesn't define your recovery. Every minute you resist strengthens your recovery muscles.",
    "You've overcome cravings before, and you can do it again. Your past strength is evidence of your capability.",
    "Physical cravings typically peak for 20-30 minutes before subsiding. Can you delay your decision just until this wave passes?"
  ];
  
  // Personalize based on craving intensity
  let responseIntro = "";
  if (craving === "extreme") {
    responseIntro = "I can see you're really struggling right now with intense cravings. This is a critical moment, and I'm here with you. ";
  } else if (craving === "severe") {
    responseIntro = "Severe cravings are really challenging. Thank you for being honest about where you're at. ";
  } else {
    responseIntro = "I understand you're experiencing cravings right now. ";
  }
  
  // Get random immediate strategy and follow-up support
  const strategy = immediateStrategies[Math.floor(Math.random() * immediateStrategies.length)];
  const support = followUpSupport[Math.floor(Math.random() * followUpSupport.length)];
  
  return `${responseIntro}First, try this: ${strategy}\n\n${support}\n\nAfter you try this, come back and let me know if it helped or if you need another strategy. I'm staying right here with you through this.`;
};

// Enhanced response system for user messages
export const getMockResponse = (userMessage: string): string => {
  const lowerMessage = userMessage.toLowerCase();
  
  // Check for crisis/relapse situations first - highest priority
  if (lowerMessage.includes('relapse') || 
      lowerMessage.includes('i used') || 
      lowerMessage.includes('i slipped') || 
      lowerMessage.includes('i failed')) {
    return "Thank you for your honesty - that takes real courage. Relapse is often part of recovery, not the end of it. What matters most is what you do right now.\n\nFirst, be gentle with yourself. Shame doesn't help recovery, but self-compassion does.\n\nSecond, try to understand what led to this moment. Was there a trigger, emotion, person, or situation that contributed?\n\nYou haven't lost all your progress. Everything you've learned about staying sober is still with you. Would you like to talk about what happened, or would you prefer to focus on your plan for the next 24 hours?";
  }
  
  if (lowerMessage.includes('craving') || 
      lowerMessage.includes('want to use') || 
      lowerMessage.includes('urge') || 
      lowerMessage.includes('tempted')) {
    // Determine craving intensity
    let cravingLevel = "moderate";
    if (lowerMessage.includes('extreme') || 
        lowerMessage.includes('unbearable') || 
        lowerMessage.includes('worst') || 
        lowerMessage.includes('can\'t take')) {
      cravingLevel = "extreme";
    } else if (lowerMessage.includes('severe') || 
               lowerMessage.includes('strong') || 
               lowerMessage.includes('really bad')) {
      cravingLevel = "severe";
    }
    
    return getCrisisResponse(cravingLevel);
  }
  
  // Check for suicidal ideation or severe mental health crisis
  if (lowerMessage.includes('kill myself') || 
      lowerMessage.includes('suicide') || 
      lowerMessage.includes('end my life') || 
      lowerMessage.includes('don\'t want to live')) {
    return "I'm concerned about what you're sharing, and I want to make sure you get the support you need. If you're having thoughts of harming yourself, please reach out to a crisis helpline where trained professionals can help:\n\n• National Suicide Prevention Lifeline: 988 or 1-800-273-8255\n• Crisis Text Line: Text HOME to 741741\n\nThese services are confidential and available 24/7. Would you like to talk more about what you're feeling? I'm here to listen without judgment.";
  }
  
  // Regular conversation flows
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return "Hi there! I'm MyBoo, your recovery companion. I'm here to support you through both challenges and victories. How are you feeling today? Remember, I'm here to listen without judgment whenever you need to talk.";
  }
  
  if (lowerMessage.includes('purpose') || lowerMessage.includes('meaning') || lowerMessage.includes('what\'s the point')) {
    return "Finding purpose during recovery is one of the most important - and challenging - parts of the journey. When substances are gone, there can be an emptiness that needs to be filled with something meaningful.\n\nMany people in recovery find purpose through:\n\n1. Helping others who are struggling\n2. Reconnecting with passions they had before addiction\n3. Discovering completely new interests\n4. Building deeper connections with loved ones\n5. Creating something (art, writing, projects)\n\nIt's normal to feel a lack of direction at first. Purpose usually emerges gradually as you build a life that aligns with your authentic values. What activities made you feel fulfilled or engaged before your addiction began?";
  }
  
  if (lowerMessage.includes('bad') || lowerMessage.includes('sad') || lowerMessage.includes('depressed') || lowerMessage.includes('awful')) {
    return "I'm sorry to hear you're going through a difficult time. These feelings are a normal part of recovery and life - they don't mean you're failing or doing something wrong.\n\nA critical thing to understand about recovery: it often feels worse before it feels better. When we remove substances, we face emotions we've been numbing, and our brain chemistry needs time to rebalance.\n\nThis difficult period isn't a sign that recovery isn't working - it's actually evidence that you're healing. You're finally processing emotions instead of escaping them.\n\nIs there a specific part of what you're feeling that's most difficult right now?";
  }
  
  if (lowerMessage.includes('feeling worse') || lowerMessage.includes('not getting better') || lowerMessage.includes('why bother')) {
    return "What you're experiencing is actually a normal part of the recovery process. When we stop numbing our emotions with substances, we often feel worse initially as our brain chemistry adjusts and we face feelings we've been avoiding.\n\nThis phenomenon is sometimes called 'the wall' or 'the valley' in recovery - it's a difficult period many people experience where emotional discomfort increases before it gets better.\n\nThe key thing to understand is that this isn't a sign that recovery isn't working - it's actually evidence that you're truly healing. You're doing the hard work of processing emotions rather than escaping them.\n\nMost people who persist through this challenging phase report that eventually, their emotional resilience grows stronger than it was before addiction. Your brain is rewiring itself, and that takes time. Would it be helpful to discuss some strategies for navigating this difficult period?";
  }
  
  if (lowerMessage.includes('good') || lowerMessage.includes('great') || lowerMessage.includes('happy') || lowerMessage.includes('better')) {
    return "That's wonderful to hear! These positive moments are so valuable for your recovery journey. When you're feeling good, it's a perfect time to reinforce your commitment and remember why sobriety matters to you.\n\nCan you identify what contributed to this positive feeling? Understanding what brings you joy and stability can help you intentionally build more of these elements into your daily life. Also, consider capturing this moment in your journal so you can look back on it during more challenging times.";
  }
  
  if (lowerMessage.includes('trigger') || lowerMessage.includes('temptation') || lowerMessage.includes('risk')) {
    return "Identifying your triggers is an important part of recovery. Each time you recognize a trigger, you're building self-awareness that strengthens your ability to stay sober.\n\nFor this specific trigger, let's break it down:\n\n1. Is it a person, place, emotion, or situation?\n2. What early warning signs might tell you this trigger is present?\n3. What's one specific strategy you could use when you encounter it?\n\nHaving a detailed plan for each trigger can transform it from a dangerous threat into a manageable challenge.";
  }
  
  if (lowerMessage.includes('help') || lowerMessage.includes('how can you')) {
    return "I'm here to support your recovery journey in several ways:\n\n• Daily conversation and emotional support without judgment\n• Help tracking your progress and celebrating milestones\n• A space to process difficult emotions and cravings\n• Structure for your day through suggested tasks and activities\n• Reminders of your strengths and reasons for recovery\n• Strategies for handling triggers and challenging situations\n\nWhat would be most helpful for you right now? I'm here to listen, reflect, or provide specific coping strategies if you're facing a particular challenge.";
  }
  
  if (lowerMessage.includes('lonely') || lowerMessage.includes('alone') || lowerMessage.includes('isolated')) {
    return "Recovery can sometimes feel lonely, especially if you've had to distance yourself from people associated with your addiction. This feeling is common but temporary as you build new connections.\n\nHave you considered reaching out to a recovery community? Groups like AA, NA, SMART Recovery, or online forums can provide understanding from people who truly get what you're experiencing. Even one connection with someone who understands can significantly reduce feelings of isolation.\n\nWhat small step could you take today to feel more connected?";
  }
  
  if (lowerMessage.includes('tired') || lowerMessage.includes('exhausted') || lowerMessage.includes('no energy')) {
    return "Recovery takes a lot of energy, especially in the early stages when your body and mind are healing. Feeling tired is completely normal.\n\nA few things that might help:\n\n• Prioritize sleep hygiene - consistent bedtime, dark room, no screens before bed\n• Stay hydrated and eat regular meals with protein\n• Consider gentle movement like walking or stretching\n• Give yourself permission to rest - recovery is hard work\n\nYour energy levels will likely improve as your body heals, but be patient with yourself during this process.";
  }
  
  if (lowerMessage.includes('why quit') || lowerMessage.includes('why stop') || lowerMessage.includes('not worth it')) {
    return "It's completely normal to question your recovery journey sometimes, especially during challenging moments. Your brain might try to convince you that using again would be easier or more enjoyable.\n\nRecovery isn't about feeling good right away - it's about healing so you can eventually feel genuine emotions again, build authentic relationships, and live with integrity. The difficult feelings you're experiencing now are part of that healing process.\n\nRecovery is hard precisely because it's worthwhile. You're rebuilding your neurological pathways, your emotional resilience, and your sense of self. This deep work often feels worse before it feels better.\n\nWhat specific aspect of recovery is feeling most challenging for you right now?";
  }
  
  if (lowerMessage.includes('structure') || lowerMessage.includes('routine') || lowerMessage.includes('bored') || lowerMessage.includes('tasks')) {
    return "Creating structure is crucial in recovery - it fills the time previously spent using or obtaining substances, and builds a foundation for your new life.\n\nI've added some suggested tasks in your Tasks tab based on your recovery stage. These include self-care activities, social connections, and productive tasks that can help rebuild confidence and purpose.\n\nEstablishing a consistent daily routine can significantly reduce cravings by minimizing decision fatigue and providing a sense of accomplishment. What part of your day currently feels most unstructured or challenging?";
  }
  
  if (lowerMessage.includes('no motivation') || lowerMessage.includes('can\'t do anything') || lowerMessage.includes('what\'s the point')) {
    return "Motivation is especially difficult in early recovery because your brain's reward system is recalibrating. What you're experiencing isn't laziness - it's a neurological process as your brain learns to find reward and meaning without substances.\n\nRather than waiting for motivation to appear, try starting with very small actions. Even completing one 5-minute task can build momentum. The structure in your Tasks tab is designed to help with exactly this challenge.\n\nAlso remember that motivation often follows action, not the other way around. Many people find that starting a task, even reluctantly, often leads to natural motivation once they're engaged.\n\nWhat's one tiny step you could take in the next hour that would feel like progress?";
  }
  
  // Default response for other messages - more personalized than the original
  return "Thank you for sharing that with me. Your openness is a strength that supports your recovery. Each time you express your thoughts and feelings, you're building self-awareness and emotional resilience.\n\nRemember that recovery isn't about perfection - it's about progress and how you respond to challenges. What would be most helpful for you to focus on for the rest of today? Is there a specific area where you could use some support or encouragement?";
};

// Mood-based responses for check-ins
export const getMockResponseBasedOnMood = (mood: string, cravingLevel: string = "none", streak: number = 0): string => {
  // Crisis intervention for high craving levels
  if (cravingLevel === "extreme" || cravingLevel === "severe") {
    return getCrisisResponse(cravingLevel);
  }
  
  const responses = {
    great: [
      "That's wonderful to hear! These positive days are building blocks for your recovery. What's one thing that contributed to your great mood today that you could intentionally incorporate more often?",
      "I'm so happy for you! Days like this are evidence of your progress. Consider writing a quick note to your future self about how good this feels - it can be powerful to read during harder days.",
      "Fantastic! Your brain is creating new pathways and associations with sobriety. Each positive day reinforces that you can feel good without substances. What healthy activities brought you joy today?"
    ],
    good: [
      "I'm glad you're having a good day! These stable, positive days are the foundation of lasting recovery. What's one small thing you did today that supported your wellbeing?",
      "That's great to hear. As you string together good days, you're building evidence that you can handle life's challenges without substances. What's a healthy coping strategy that worked well for you recently?",
      "Good days are worth celebrating in recovery. Your brain is learning that you can experience positive emotions without substances. What's something you're looking forward to tomorrow?"
    ],
    neutral: [
      "Neutral days are an important part of recovery too - learning to be okay with ordinary moments without seeking artificial highs or escaping discomfort. How are you taking care of yourself today?",
      "Thanks for checking in. Even on neutral days, you're still making progress by staying committed to your recovery. Is there one small positive action you could take to nurture yourself today?",
      "Neutral days are completely normal and healthy. Recovery isn't always about feeling amazing - it's also about developing comfort with the full range of human emotions. What's one small win you can acknowledge today?"
    ],
    bad: [
      "I'm sorry you're having a difficult day. Challenging emotions are part of recovery and life - the difference now is that you're developing the strength to face them without substances. What's one small thing that might help you feel a bit better right now?",
      "Tough days are part of the journey. Remember that you've gotten through difficult days before, and you'll get through this one too. Could you try one small self-care activity in the next hour?",
      "I hear that today is difficult. These moments are when your recovery muscles grow stronger. Rather than escaping the discomfort, you're developing the ability to sit with it. What's one healthy coping strategy you could try right now?"
    ],
    terrible: [
      "I'm really sorry you're feeling this way. These intensely difficult moments are temporary, even when they don't feel that way. Your priority right now is just getting through the next few hours with gentleness toward yourself. Would it help to reach out to someone in your support network?",
      "When things feel this overwhelming, focus on the basics: Are you hydrated? Have you eaten? Could you step outside for 10 minutes? Sometimes our physical state intensifies our emotional distress. What's one tiny step you could take to care for yourself right now?",
      "I'm here with you through this incredibly hard time. Recovery has peaks and valleys, and this difficult moment doesn't erase your progress. Can you think of one time in the past when you felt terrible but got through it? That same strength is still within you."
    ]
  };

  // Early recovery messaging (0-30 days)
  if (streak < 30) {
    if (mood === 'bad' || mood === 'terrible') {
      return `${responses[mood as keyof typeof responses][Math.floor(Math.random() * responses[mood as keyof typeof responses].length)]}\n\nIt's normal for things to feel worse before they feel better in early recovery. Your brain chemistry is adjusting, and you're facing emotions you may have been numbing. This difficult period isn't a sign that recovery isn't working - it's actually evidence that you're healing. The discomfort you're feeling is temporary, but the strength you're building will last.`;
    }
  }

  // Add craving-specific content for moderate cravings
  if (cravingLevel === "moderate") {
    return `${responses[mood as keyof typeof responses][Math.floor(Math.random() * responses[mood as keyof typeof responses].length)]}\n\nI notice you're experiencing moderate cravings today. Remember that cravings are temporary and will pass. Try drinking a large glass of water, taking a 10-minute walk, or calling a supportive friend to help ride out this wave.`;
  } else if (cravingLevel === "mild") {
    return `${responses[mood as keyof typeof responses][Math.floor(Math.random() * responses[mood as keyof typeof responses].length)]}\n\nI see you're having mild cravings today. That's normal in recovery, and noticing them is a sign of your growing self-awareness. Consider it a reminder to practice extra self-care today.`;
  }

  return responses[mood as keyof typeof responses][Math.floor(Math.random() * responses[mood as keyof typeof responses].length)];
};

// Generate emotional insights for users
export const getEmotionalInsight = (mood: string, cravingLevel: string, streak: number): string | null => {
  // Early recovery insights (0-30 days)
  if (streak < 30) {
    if (mood === 'bad' || mood === 'terrible') {
      return "Early recovery often feels worse before it feels better. Your brain is healing and learning to process emotions without substances. This discomfort is evidence of healing, not failure.";
    }
    
    if (cravingLevel === 'severe' || cravingLevel === 'extreme') {
      return "Strong cravings in early recovery are normal and don't mean you're doing something wrong. Each time you resist, you're building new neural pathways that will eventually make recovery easier.";
    }
    
    return "The early days of recovery are often the hardest. Your brain and body are adjusting to functioning without substances. Be patient with yourself - you're doing something incredibly difficult.";
  }
  
  // Medium-term recovery insights (30-90 days)
  if (streak >= 30 && streak < 90) {
    if (mood === 'good' || mood === 'great') {
      return "You're experiencing what many call the 'pink cloud' - a period of optimism and positive feelings as your body heals. Enjoy these good feelings while preparing for the natural emotional fluctuations that are part of recovery.";
    }
    
    if (cravingLevel === 'mild' || cravingLevel === 'moderate') {
      return "As recovery progresses, cravings often become less frequent but can still be triggered by specific people, places, or emotions. Your growing self-awareness is a powerful recovery tool.";
    }
    
    return "At this stage of recovery, many people begin to face the underlying issues that contributed to their addiction. This deeper emotional work can be challenging but leads to lasting healing.";
  }
  
  // Longer-term recovery insights (90+ days)
  if (streak >= 90) {
    return "Long-term recovery isn't just about not using substances - it's about building a meaningful life where substances aren't needed. Your ongoing commitment to this process is remarkable.";
  }
  
  // General insights that apply to any stage
  const generalInsights = [
    "Recovery isn't about feeling good all the time - it's about feeling everything authentically and developing healthier responses to life's challenges.",
    "The purpose of recovery isn't just abstinence, but building a life where substances aren't needed to cope or find meaning.",
    "Emotions are like waves - they rise, peak, and eventually subside. Learning to ride these waves without substances is a core recovery skill."
  ];
  
  return generalInsights[Math.floor(Math.random() * generalInsights.length)];
};

// Generate suggested tasks based on recovery stage and categories
export const getRecoveryTask = (category: string, recoveryDays: number): { title: string, description: string, timeEstimate?: number } => {
  const earlyRecoveryTasks = {
    'self-care': [
      {
        title: "Practice 5-minute mindfulness",
        description: "Sit quietly and focus on your breath for just 5 minutes. Notice when your mind wanders and gently return to your breathing.",
        timeEstimate: 5
      },
      {
        title: "Take a hot shower or bath",
        description: "Use this time to practice being present with physical sensations rather than caught in thoughts.",
        timeEstimate: 20
      },
      {
        title: "Drink water throughout the day",
        description: "Set a goal to drink at least 64oz of water today. Proper hydration supports brain function and physical healing.",
        timeEstimate: 5
      }
    ],
    'physical': [
      {
        title: "Go for a 10-minute walk",
        description: "Even brief exercise releases endorphins that can reduce cravings and improve mood.",
        timeEstimate: 10
      },
      {
        title: "Stretch for 5 minutes",
        description: "Simple stretching can reduce physical tension that might be triggering cravings or negative emotions.",
        timeEstimate: 5
      },
      {
        title: "Get 30 minutes of sunlight",
        description: "Sunlight exposure helps regulate your body's natural rhythm and improves vitamin D production, both helpful for mood.",
        timeEstimate: 30
      }
    ],
    'social': [
      {
        title: "Text one supportive person",
        description: "Send a message to someone who knows about and supports your recovery. Even brief connection helps.",
        timeEstimate: 5
      },
      {
        title: "Identify recovery meeting options",
        description: "Find three in-person or online recovery meetings you could potentially attend this week.",
        timeEstimate: 20
      },
      {
        title: "Practice saying no",
        description: "Write down and practice three different ways to decline if someone offers you substances.",
        timeEstimate: 15
      }
    ],
    'productive': [
      {
        title: "Clean one small space",
        description: "Choose a drawer, shelf, or surface and organize it completely. Small accomplishments build confidence.",
        timeEstimate: 15
      },
      {
        title: "Make your bed",
        description: "This simple act of order can provide a sense of accomplishment first thing in the morning.",
        timeEstimate: 5
      },
      {
        title: "Create a daily schedule",
        description: "Plan tomorrow's activities hour by hour to provide structure and reduce decision fatigue.",
        timeEstimate: 20
      }
    ],
    'recovery': [
      {
        title: "Write down 3 triggers",
        description: "Identify three specific situations, emotions, or people that trigger cravings for you.",
        timeEstimate: 15
      },
      {
        title: "List your reasons for recovery",
        description: "Write down at least 5 specific reasons why you want to maintain your sobriety.",
        timeEstimate: 20
      },
      {
        title: "Create a crisis card",
        description: "Write down 3 people you can call and 3 actions you can take when experiencing severe cravings.",
        timeEstimate: 15
      }
    ]
  };

  const midRecoveryTasks = {
    'self-care': [
      {
        title: "Practice 15-minute meditation",
        description: "Extend your mindfulness practice to 15 minutes, focusing on acceptance of thoughts and feelings.",
        timeEstimate: 15
      },
      {
        title: "Identify one boundary to set",
        description: "Reflect on a relationship or situation where you need to establish or reinforce a healthy boundary.",
        timeEstimate: 20
      },
      {
        title: "Create a sleep routine",
        description: "Establish a consistent bedtime ritual to improve sleep quality, which supports recovery.",
        timeEstimate: 30
      }
    ],
    'physical': [
      {
        title: "30-minute exercise session",
        description: "Choose any physical activity you enjoy and engage in it for at least 30 minutes.",
        timeEstimate: 30
      },
      {
        title: "Prepare a nutritious meal",
        description: "Cook a balanced meal with protein, complex carbs, and vegetables to support brain healing.",
        timeEstimate: 45
      },
      {
        title: "Check in with your body",
        description: "Do a full body scan and note any physical sensations, tension, or discomfort without judgment.",
        timeEstimate: 10
      }
    ],
    'social': [
      {
        title: "Attend a recovery meeting",
        description: "Participate in an in-person or online recovery support meeting of your choice.",
        timeEstimate: 60
      },
      {
        title: "Have a substance-free social interaction",
        description: "Connect with someone in a setting that doesn't involve substances (coffee, walk, activity).",
        timeEstimate: 60
      },
      {
        title: "Practice sharing feelings",
        description: "Have a conversation where you honestly share how your recovery is going with someone you trust.",
        timeEstimate: 30
      }
    ],
    'productive': [
      {
        title: "Set one small goal for the week",
        description: "Choose one achievable objective related to work, home, or personal development.",
        timeEstimate: 15
      },
      {
        title: "Learn something new for 20 minutes",
        description: "Spend time reading, watching educational content, or practicing a new skill.",
        timeEstimate: 20
      },
      {
        title: "Complete one postponed task",
        description: "Choose one task you've been avoiding and complete it to reduce background stress.",
        timeEstimate: 30
      }
    ],
    'recovery': [
      {
        title: "Identify a recurring thought pattern",
        description: "Notice and write down a thought pattern that often precedes cravings or negative emotions.",
        timeEstimate: 20
      },
      {
        title: "Practice a new coping strategy",
        description: "Choose and try a coping technique you haven't used before from the Coping Skills library.",
        timeEstimate: 30
      },
      {
        title: "Reflect on recovery progress",
        description: "Write about how your relationship with substances has changed since beginning recovery.",
        timeEstimate: 25
      }
    ]
  };

  const advancedRecoveryTasks = {
    'self-care': [
      {
        title: "Explore personal values",
        description: "Identify 3-5 core values that are important to you now and how recovery helps honor them.",
        timeEstimate: 30
      },
      {
        title: "Practice self-compassion meditation",
        description: "Do a guided self-compassion meditation focused on extending kindness to yourself.",
        timeEstimate: 20
      },
      {
        title: "Create a wellness plan",
        description: "Develop a written plan that addresses physical, emotional, social and spiritual well-being.",
        timeEstimate: 45
      }
    ],
    'physical': [
      {
        title: "Try a new physical activity",
        description: "Experiment with a form of movement you haven't tried before or haven't done recently.",
        timeEstimate: 45
      },
      {
        title: "Complete a fitness challenge",
        description: "Set a specific, measurable physical goal and complete it (specific number of reps, distance, etc).",
        timeEstimate: 40
      },
      {
        title: "Practice progressive relaxation",
        description: "Systematically tense and relax each muscle group to release physical tension.",
        timeEstimate: 20
      }
    ],
    'social': [
      {
        title: "Reach out to support someone else",
        description: "Contact someone else in recovery and offer encouragement or assistance.",
        timeEstimate: 20
      },
      {
        title: "Share your recovery story",
        description: "Consider sharing some aspect of your journey with someone who might benefit from hearing it.",
        timeEstimate: 30
      },
      {
        title: "Expand your social circle",
        description: "Identify one new social opportunity that aligns with your interests and values.",
        timeEstimate: 60
      }
    ],
    'productive': [
      {
        title: "Work on a meaningful project",
        description: "Spend time on a project that gives you a sense of purpose and accomplishment.",
        timeEstimate: 60
      },
      {
        title: "Organize digital or physical spaces",
        description: "Clear clutter from your email, files, or physical spaces to reduce background stress.",
        timeEstimate: 45
      },
      {
        title: "Research a topic of interest",
        description: "Explore a subject you're curious about through reading, listening, or watching content.",
        timeEstimate: 40
      }
    ],
    'recovery': [
      {
        title: "Create a relapse prevention plan",
        description: "Develop a detailed written plan for handling high-risk situations and warning signs.",
        timeEstimate: 60
      },
      {
        title: "Practice a difficult conversation",
        description: "Write out or role play a challenging conversation related to your recovery.",
        timeEstimate: 30
      },
      {
        title: "Review and update recovery goals",
        description: "Reflect on your initial recovery goals and adjust them based on what you've learned.",
        timeEstimate: 45
      }
    ]
  };
  
  let taskPool;
  
  if (recoveryDays < 30) {
    // Early recovery - focus on basics and immediate coping
    taskPool = earlyRecoveryTasks[category as keyof typeof earlyRecoveryTasks];
  } else if (recoveryDays < 90) {
    // Mid recovery - more skill building and routine establishment
    taskPool = midRecoveryTasks[category as keyof typeof midRecoveryTasks];
  } else {
    // Advanced recovery - identity development and deeper work
    taskPool = advancedRecoveryTasks[category as keyof typeof advancedRecoveryTasks];
  }
  
  // Select a random task from the appropriate category and recovery stage
  return taskPool[Math.floor(Math.random() * taskPool.length)];
};