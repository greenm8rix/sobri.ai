import React, { useState } from 'react';
import { Clock, Brain, Activity, UserPlus, ThumbsUp } from 'lucide-react';
import { motion } from 'framer-motion';

type CopingCategory = 'immediate' | 'cognitive' | 'physical' | 'social' | 'longterm';

const CopingSkills: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<CopingCategory>('immediate');
  
  const categories = [
    { id: 'immediate', label: 'Immediate Relief', icon: Clock, color: 'bg-red-50 text-red-700 border-red-100' },
    { id: 'cognitive', label: 'Thought Strategies', icon: Brain, color: 'bg-blue-50 text-blue-700 border-blue-100' },
    { id: 'physical', label: 'Physical Techniques', icon: Activity, color: 'bg-green-50 text-green-700 border-green-100' },
    { id: 'social', label: 'Social Support', icon: UserPlus, color: 'bg-purple-50 text-purple-700 border-purple-100' },
    { id: 'longterm', label: 'Long-term Strategies', icon: ThumbsUp, color: 'bg-amber-50 text-amber-700 border-amber-100' }
  ];
  
  const copingSkills = {
    immediate: [
      {
        title: "HALT Check",
        description: "Ask yourself if you're Hungry, Angry, Lonely, or Tired. Address these basic needs first.",
        steps: [
          "Identify which of these needs might be triggering cravings",
          "Take immediate action (eat, calm down, call someone, or rest)",
          "Reassess your craving level after addressing the need"
        ]
      },
      {
        title: "Urge Surfing",
        description: "Visualize your craving as a wave that will rise, peak, and eventually subside.",
        steps: [
          "Notice the physical sensations of the craving",
          "Breathe deeply and observe these sensations without judgment",
          "Visualize riding the wave until it naturally subsides",
          "Remember: most urges peak at 20-30 minutes, then decrease"
        ]
      },
      {
        title: "5-4-3-2-1 Grounding",
        description: "Use your senses to ground yourself in the present moment.",
        steps: [
          "Name 5 things you can see",
          "Name 4 things you can physically feel",
          "Name 3 things you can hear",
          "Name 2 things you can smell",
          "Name 1 thing you can taste"
        ]
      },
      {
        title: "Cold Water Technique",
        description: "Using temperature to interrupt craving patterns.",
        steps: [
          "Fill a bowl with cold water or grab an ice cube",
          "Dip your face in the water or hold the ice in your hand",
          "Focus intently on the physical sensation",
          "This activates the parasympathetic nervous system to calm your body"
        ]
      }
    ],
    cognitive: [
      {
        title: "Thought Challenging",
        description: "Identify and challenge unhelpful thoughts that contribute to cravings.",
        steps: [
          "Write down your craving-related thought (e.g., 'One use won't hurt')",
          "Identify the thinking distortion (e.g., minimizing consequences)",
          "Challenge with evidence ('Previous 'just once' led to relapse')",
          "Create a more realistic thought ('Using now will threaten my progress')"
        ]
      },
      {
        title: "Playing the Tape Forward",
        description: "Visualize the full consequences of giving in to the craving.",
        steps: [
          "Imagine in detail what would happen if you use",
          "Include both immediate aftermath and longer-term effects",
          "Visualize how you'll feel tomorrow, next week, next month",
          "Focus on specific consequences to relationships, work, health"
        ]
      },
      {
        title: "Values Reconnection",
        description: "Remind yourself of your deeper values and why recovery matters.",
        steps: [
          "Keep a list of your core values (e.g., health, family, integrity)",
          "Review how sobriety aligns with these values",
          "Write about how substance use conflicts with these values",
          "Visualize your future self thanking you for staying strong now"
        ]
      }
    ],
    physical: [
      {
        title: "Progressive Muscle Relaxation",
        description: "Systematically tensing and relaxing muscle groups to reduce physical tension.",
        steps: [
          "Find a quiet place to sit or lie down",
          "Tense each muscle group for 5-10 seconds, then release",
          "Work from toes to head, noticing the difference between tension and relaxation",
          "Focus on your breathing between each muscle group"
        ]
      },
      {
        title: "Intense Exercise Burst",
        description: "Quick, intense physical activity to change your physiological state.",
        steps: [
          "Choose a simple exercise (jumping jacks, push-ups, brisk walk)",
          "Do it intensely for 1-5 minutes",
          "Focus completely on the physical sensations",
          "This releases endorphins and changes brain chemistry"
        ]
      },
      {
        title: "4-7-8 Breathing",
        description: "A breathing pattern to activate relaxation response.",
        steps: [
          "Inhale quietly through your nose for 4 seconds",
          "Hold your breath for 7 seconds",
          "Exhale completely through your mouth for 8 seconds",
          "Repeat 4 times"
        ]
      }
    ],
    social: [
      {
        title: "Call Your Support Person",
        description: "Reach out to someone who understands your recovery journey.",
        steps: [
          "Keep 2-3 support contacts in your favorites list",
          "Tell them honestly: 'I'm having strong cravings right now'",
          "Ask them to listen, distract you, or remind you of your progress",
          "Stay on the phone until the urge decreases"
        ]
      },
      {
        title: "Online Support Group",
        description: "Connect with recovery communities available 24/7.",
        steps: [
          "Bookmark online meeting resources (AA/NA online, SMART Recovery)",
          "Join a meeting even if it's already in progress",
          "Share that you're struggling right now",
          "Listen to others' experiences with cravings and how they cope"
        ]
      },
      {
        title: "Accountable Messaging",
        description: "Text your accountability partner about your craving.",
        steps: [
          "Establish a person you can text anytime about cravings",
          "Send a message describing your craving level and situation",
          "Commit to checking in again in 30 minutes",
          "Knowing you'll report back increases your commitment to resist"
        ]
      }
    ],
    longterm: [
      {
        title: "Trigger Identification & Planning",
        description: "Map your personal triggers and develop specific response plans.",
        steps: [
          "List all your known triggers (people, places, emotions, situations)",
          "Rate each trigger by intensity (1-10)",
          "Develop a specific plan for each high-intensity trigger",
          "Practice your response plans through visualization or role-play"
        ]
      },
      {
        title: "Daily Meditation Practice",
        description: "Build mindfulness skills to observe cravings without acting on them.",
        steps: [
          "Start with just 5 minutes of meditation daily",
          "Focus on observing thoughts without judgment",
          "Gradually increase duration as your skills improve",
          "Use guided meditation apps focused on addiction recovery"
        ]
      },
      {
        title: "H.O.W. Program",
        description: "A framework for daily recovery maintenance.",
        steps: [
          "Honesty: Daily self-check about thoughts, feelings, and behaviors",
          "Open-mindedness: Consider new recovery strategies and perspectives",
          "Willingness: Take concrete actions each day that support your recovery"
        ]
      },
      {
        title: "Lifestyle Redesign",
        description: "Gradually reshape your environment and activities to support sobriety.",
        steps: [
          "Identify aspects of your lifestyle that supported addiction",
          "Create substitute activities that provide similar benefits",
          "Gradually build new social connections through healthy activities",
          "Redesign your physical spaces to remove triggers and add positive cues"
        ]
      }
    ]
  };
  
  const selectedSkills = copingSkills[selectedCategory];
  const selectedCategoryInfo = categories.find(c => c.id === selectedCategory);
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold mb-2">Coping Skills Library</h2>
      <p className="text-gray-600 mb-6">
        Evidence-based techniques to manage cravings and build recovery skills.
      </p>
      
      {/* Category Selection */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6">
        {categories.map((category) => {
          const isSelected = category.id === selectedCategory;
          const CategoryIcon = category.icon;
          
          return (
            <button 
              key={category.id}
              onClick={() => setSelectedCategory(category.id as CopingCategory)}
              className={`p-3 rounded-lg border flex flex-col items-center text-center transition-colors duration-200
                ${isSelected 
                  ? category.color
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }
              `}
            >
              <CategoryIcon size={20} className="mb-1" />
              <span className="text-xs font-medium">{category.label}</span>
            </button>
          );
        })}
      </div>
      
      {/* Skills List */}
      <div className="space-y-6">
        {selectedSkills.map((skill, index) => (
          <motion.div
            key={`${selectedCategory}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <div className={`${selectedCategoryInfo?.color} p-4`}>
              <h3 className="font-medium">{skill.title}</h3>
              <p className="text-sm mt-1">{skill.description}</p>
            </div>
            
            <div className="p-4 bg-white">
              <h4 className="text-sm font-medium mb-2">How to practice:</h4>
              <ol className="space-y-2">
                {skill.steps.map((step, stepIndex) => (
                  <li key={stepIndex} className="text-sm flex items-start">
                    <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                      {stepIndex + 1}
                    </span>
                    <span className="text-gray-700">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
        <h3 className="font-medium mb-1">Practice makes progress</h3>
        <p className="text-sm text-gray-600">
          These skills become more effective with regular practice. Try to work with these techniques
          when your cravings are at a 3-4 out of 10, so you can build your skills before facing
          more intense urges.
        </p>
      </div>
    </div>
  );
};

export default CopingSkills;