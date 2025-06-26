import { useState, useEffect } from 'react';
import { useAsyncStorage, useCurrentUser } from '@shopify/shop-minis-react';
import { useClearProfileStorage } from '../../hooks/clearProfileData';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Edit, X, Check, User } from 'lucide-react';

const CATEGORY_OPTIONS = [
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
];

const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male', icon: '👨' },
  { value: 'Female', label: 'Female', icon: '👩' },
  { value: 'Other', label: 'Other', icon: '🎭' }
];

export function ProfileTab() {
  const { setItem, getItem } = useAsyncStorage();
  const { clearProfileData } = useClearProfileStorage();
  const { currentUser, loading: userLoading, error: userError } = useCurrentUser();
  const [gender, setGender] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const g = await getItem({ key: 'gender' });
        const c = await getItem({ key: 'categories' });
        setGender(g ?? '');
        setCategories(c ? JSON.parse(c) : []);
      } catch (error) {
        console.error('Error loading profile data:', error);
      }
    };

    loadProfileData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setItem({ key: 'gender', value: gender });
      await setItem({ key: 'categories', value: JSON.stringify(categories) });
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setIsEditing(false);
      }, 1500);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleCategory = (categoryName: string) => {
    setCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  return (
    <div className="px-4 pt-4 relative min-h-screen pb-20">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-white">Profile Settings</h2>
          <p className="text-white/70">Manage your preferences</p>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="p-2 text-white hover:bg-white/10 rounded-full"
        >
          {isEditing ? <X size={24} /> : <Edit size={24} />}
        </button>
      </div>

      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed top-10 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2"
          >
            <Check size={18} />
            <span>Profile saved successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Profile Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-6 p-4 bg-white/10 border border-white/20 backdrop-blur-sm rounded-lg"
      >
        <div className="w-16 h-16 rounded-full bg-highlight border border-white/50 flex items-center justify-center overflow-hidden">
          {currentUser?.avatarImage?.url ? (
            <img 
              src={currentUser.avatarImage.url} 
              alt="User avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <User size={32} className="text-white" />
          )}
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">
            {currentUser?.displayName || 'Shop User'}
          </h2>
          <p className="text-white/70 text-sm">Your shopping profile</p>
        </div>
      </motion.div>

      {userLoading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center py-10"
        >
          <div className="w-12 h-12 rounded-full border-4 border-highlight/50 border-t-transparent animate-spin" />
        </motion.div>
      )}

      {userError && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-900/40 backdrop-blur-sm rounded-xl p-4 mb-6 border border-red-500/30"
        >
          <p className="text-red-200 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Error loading user: {userError.message}
          </p>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="edit"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Gender Selection */}
            <motion.div 
              className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-lg p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <label className="block text-white font-medium mb-3">
                Gender
              </label>
              <div className="grid grid-cols-3 gap-2">
                {GENDER_OPTIONS.map((option) => (
                  <motion.button
                    key={option.value}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setGender(option.value)}
                    className={`py-2 px-1 border rounded-md text-sm ${
                      gender === option.value
                        ? 'border-white bg-highlight text-white' 
                        : 'border-white/20 text-white/70 hover:border-white/40'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-xl">{option.icon}</span>
                      <span>{option.label}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Categories Selection */}
            <motion.div 
              className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-lg p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-white font-medium mb-3">
                Interests
                <span className="block text-white/50 text-xs font-normal mt-1">
                  Select all that apply
                </span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORY_OPTIONS.map((category) => (
                  <motion.button
                    key={category.name}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => toggleCategory(category.name)}
                    className={`py-2 px-1 border rounded-md text-sm ${
                      categories.includes(category.name)
                        ? 'border-white bg-highlight text-white' 
                        : 'border-white/20 text-white/70 hover:border-white/40'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-xl">{category.icon}</span>
                      <span className="text-xs mt-1">{category.name}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div 
              className="flex gap-3 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 py-3 rounded-md font-medium bg-red-500/10 text-red-500 border-1 border-red-500/80"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={isSaving}
                className={`flex-1 py-3 rounded-md font-medium ${
                  isSaving
                    ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                    : 'bg-highlight text-white hover:bg-highlight border border-white'
                }`}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </motion.button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Profile Info Display */}
            <motion.div 
              className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-lg p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-highlight border border-white/30 p-1.5 rounded-md">
                  <User size={18} className="text-white" />
                </div>
                <h3 className="text-white font-medium">
                  Gender
                </h3>
              </div>
              <div className="flex items-center gap-3 mt-2">
                {gender ? (
                  <>
                    <div className="w-10 h-10 rounded-md bg-highlight flex items-center justify-center">
                      <span className="text-xl">
                        {GENDER_OPTIONS.find(g => g.value === gender)?.icon}
                      </span>
                    </div>
                    <p className="text-white/90">{gender}</p>
                  </>
                ) : (
                  <p className="text-white/50 italic text-sm">Not specified</p>
                )}
              </div>
            </motion.div>

            <motion.div 
              className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-lg p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-highlight border border-white/30 p-1.5 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <h3 className="text-white font-medium">
                  Interests
                  <span className="block text-white/70 text-xs font-normal">
                    {categories.length} selected
                  </span>
                </h3>
              </div>
              
              {categories.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-3">
                  {categories.map((category) => {
                    const categoryInfo = CATEGORY_OPTIONS.find(c => c.name === category);
                    return (
                      <motion.div
                        key={category}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-1 bg-white/10 rounded-lg px-3 py-1.5 backdrop-blur-sm border border-white/10 text-sm"
                      >
                        {categoryInfo?.icon && (
                          <span>{categoryInfo.icon}</span>
                        )}
                        <span className="text-white/90">{category}</span>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-white/50 italic text-sm">No interests selected</p>
              )}
            </motion.div>

            {/* Action Buttons */}
            <motion.div 
              className="flex gap-3 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsEditing(true)}
                className="flex-1 py-3 rounded-md font-medium bg-highlight text-white border border-white hover:bg-highlight/70"
              >
                Edit Profile
              </motion.button>
              <button
                onClick={clearProfileData}
                className="flex items-center justify-center gap-1 py-3 px-4 rounded-md font-medium bg-red-500/10 text-red-500 border-2 border-red-500/80"
              >
                <Trash2 size={18} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}