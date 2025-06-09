import React from 'react';
import { Zap, Users, Smile, BookOpen, Headphones, Sun, Moon, MessageCircle, Edit3, Shield } from 'lucide-react';

interface CopingSkill {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  steps?: string[];
  color: string;
}

const copingSkills: CopingSkill[] = [
  {
    id: 'mindfulness',
    title: "Mindful Moment",
    description: "Ground yourself in the present.",
    icon: Zap,
    steps: [
      "Find a comfortable position.",
      "Focus on your breath for 1-5 minutes.",
      "Notice sensations without judgment.",
      "Gently bring your mind back if it wanders."
    ],
    color: "bg-blue-100 text-blue-700"
  },
  {
    id: 'connect',
    title: "Connect with Someone",
    description: "Reach out to a friend or family member.",
    icon: Users,
    steps: [
      "Think of someone you trust.", // Changed from "supportive"
      "Send a text, call, or meet up.",
      "Share how you're feeling honestly.",
      "Listen actively to them as well."
    ],
    color: "bg-green-100 text-green-700"
  },
  {
    id: 'positive_self_talk',
    title: "Positive Self-Talk",
    description: "Challenge negative thoughts with kind words.",
    icon: Smile,
    steps: [
      "Identify a negative thought.",
      "Question its validity: Is it 100% true?",
      "Reframe it into a more balanced or positive statement.",
      "Repeat the positive affirmation to yourself."
    ],
    color: "bg-yellow-100 text-yellow-700"
  },
  {
    id: 'distraction',
    title: "Healthy Distraction",
    description: "Engage in an enjoyable activity.",
    icon: Headphones,
    steps: [
      "Choose an activity you find absorbing (music, hobby, puzzle).",
      "Set a timer for 15-30 minutes.",
      "Immerse yourself fully in the activity.",
      "Notice how you feel afterwards."
    ],
    color: "bg-purple-100 text-purple-700"
  },
  {
    id: 'journaling',
    title: "Expressive Writing",
    description: "Write down your thoughts and feelings.",
    icon: Edit3,
    steps: [
      "Find a quiet space and a notebook or device.",
      "Write freely for 10-20 minutes without censoring yourself.",
      "Focus on your emotions and what's causing them.",
      "Review what you wrote for insights, if helpful."
    ],
    color: "bg-pink-100 text-pink-700"
  },
  {
    id: 'gratitude',
    title: "Practice Gratitude",
    description: "Focus on what you're thankful for.",
    icon: Sun,
    steps: [
      "Think of 3-5 things you're grateful for today.",
      "They can be big or small.",
      "Write them down or say them aloud.",
      "Reflect on why you're grateful for each."
    ],
    color: "bg-orange-100 text-orange-700"
  },
  {
    id: 'problem_solving',
    title: "Problem-Solving Steps",
    description: "Break down a challenge into manageable parts.",
    icon: Shield,
    steps: [
      "Clearly define the problem.",
      "Brainstorm potential solutions (even silly ones!).",
      "Evaluate the pros and cons of each solution.",
      "Choose one solution and make a plan to implement it."
    ],
    color: "bg-teal-100 text-teal-700"
  }
];


const CopingSkills: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold mb-2">Coping Skills</h2>
      <p className="text-gray-600 mb-6">
        Techniques to manage difficult emotions and situations.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {copingSkills.map((skill) => (
          <div key={skill.id} className={`p-4 rounded-lg border ${skill.color.replace('bg-', 'border-')}`}>
            <div className="flex items-center mb-2">
              <skill.icon size={20} className={`mr-2 ${skill.color.replace('bg-', 'text-')}`} />
              <h3 className="font-medium text-gray-800">{skill.title}</h3>
            </div>
            <p className="text-xs text-gray-600 mb-3">{skill.description}</p>
            {skill.steps && (
              <ul className="space-y-1 text-xs text-gray-600 list-disc list-inside">
                {skill.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CopingSkills;
