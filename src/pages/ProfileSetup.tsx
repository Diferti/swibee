import { useState } from 'react';
import { useAsyncStorage } from '@shopify/shop-minis-react';

type Props = { onComplete: () => Promise<void> };

export default function ProfileSetup({ onComplete }: Props) {
  const { setItem } = useAsyncStorage();
  const [step, setStep] = useState(1);
  const [gender, setGender] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenderContinue = async () => {
    setLoading(true);
    try {
      await setItem({ key: 'gender', value: gender });
      setStep(2);
    } catch (error) {
      console.error('Error saving gender:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoriesFinish = async () => {
    setLoading(true);
    try {
      await setItem({ key: 'categories', value: JSON.stringify(categories) });
      await onComplete();
    } catch (error) {
      console.error('Error saving categories:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#5436CA] via-[#664BD8] to-[#7B64EA] px-4 py-6 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to Swibee</h1>
          <p className="text-white/80 text-sm">
            {step === 1 ? "Let's personalize your experience" : 'Choose your interests'}
          </p>
        </div>

        {/* Step 1: Gender Selection */}
        {step === 1 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20">
            <label className="block text-sm font-semibold text-white mb-3">
              What's your gender?
            </label>
            <div className="space-y-3">
              {[
                { value: 'Male', label: 'Male', icon: '👨' },
                { value: 'Female', label: 'Female', icon: '👩' },
                { value: 'Other', label: 'Other', icon: '🎭' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setGender(option.value)}
                  className={`w-full flex items-center p-4 rounded-xl border-2 transition-all duration-200 ${
                    gender === option.value
                      ? 'border-white bg-highlight text-white'
                      : 'border-white/30 bg-white/10 text-white hover:border-white/50'
                  }`}
                >
                  <span className="text-xl mr-3">{option.icon}</span>
                  <span className="font-medium">{option.label}</span>
                  {gender === option.value && (
                    <span className="ml-auto bg-highlight rounded-full p-1">
                      <svg className="w-5 h-5 text-white border-2 border-white rounded-full" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={handleGenderContinue}
              disabled={!gender || loading}
              className={`w-full mt-8 py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-200 ${
                gender && !loading
                  ? 'bg-highlight text-white shadow-lg hover:shadow-xl hover:bg-highlight/90 active:scale-95'
                  : 'bg-white/20 text-white/50 cursor-not-allowed'
              }`}
            >
              {loading ? 'Saving...' : 'Continue'}
            </button>
            <div className="mt-6 text-center">
              <div className="flex justify-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-white"></div>
                <div className="w-2 h-2 rounded-full bg-white/30"></div>
              </div>
              <p className="text-xs text-white/70 mt-2">Step 1 of 2</p>
            </div>
          </div>
        )}

        {/* Step 2: Categories Selection */}
        {step === 2 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20 flex flex-col">
            <label className="block text-sm font-semibold text-white mb-3">
              What interests you? (Select all that apply)
            </label>
            
            {/* Scrollable categories container */}
            <div className="flex-grow overflow-y-auto max-h-[50vh] pr-2 pt-2 mb-4 custom-scrollbar">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: "Clothing", icon: "👕" },
                  { name: "Electronics", icon: "💻" },
                  { name: "Beauty", icon: "💅" },
                  { name: "Accessories", icon: "🕶️" },
                  { name: "Home", icon: "🏠" },
                  { name: "Baby & Toddler", icon: "🍼" },
                  { name: "Food & Drink", icon: "🍔" },
                  { name: "Fitness & Nutrition", icon: "💪" },
                  { name: "Toys & Games", icon: "🧸" },
                  { name: "Art & Crafts", icon: "🎨" },
                  { name: "Luggage & Bags", icon: "🧳" },
                  { name: "Sporting Goods", icon: "⚽" },
                ].map((category) => (
                  <button
                    key={category.name}
                    onClick={() =>
                      setCategories((prev) =>
                        prev.includes(category.name)
                          ? prev.filter(c => c !== category.name)
                          : [...prev, category.name]
                      )
                    }
                    className={`relative p-3 rounded-xl border-2 transition-all duration-200 flex items-center ${
                      categories.includes(category.name)
                        ? 'border-white bg-highlight text-white shadow-[0_0_0_4px_rgba(102,68,243,0.5)]'
                        : 'border-white/30 bg-white/10 text-white hover:border-white/50'
                    }`}
                  >
                    <span className="text-xl mr-2 flex-shrink-0">{category.icon}</span>
                    <span className="text-xs font-medium text-left flex-grow">{category.name}</span>
                    {categories.includes(category.name) && (
                      <div className="absolute -top-2 -right-2 bg-highlight rounded-full p-1 shadow-md z-10">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={handleCategoriesFinish}
              disabled={categories.length === 0 || loading}
              className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-200 mt-auto ${
                categories.length > 0 && !loading
                  ? 'bg-highlight text-white shadow-lg hover:shadow-xl hover:bg-highlight/90 active:scale-95'
                  : 'bg-white/20 text-white/50 cursor-not-allowed'
              }`}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <div className="mt-6 text-center">
              <div className="flex justify-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-white"></div>
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
              <p className="text-xs text-white/70 mt-2">Step 2 of 2</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}