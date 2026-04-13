import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera } from 'lucide-react';

const INTERESTS = [
  'Coffee ☕', 'Sports 🏃', 'Movies 🎬', 'Music 🎵', 'Art 🎨',
  'Reading 📚', 'Travel ✈️', 'Gaming 🎮', 'Cooking 🍳', 'Hiking 🥾',
  'Photography 📷', 'Dancing 💃', 'Yoga 🧘', 'Shopping 🛍️', 'Pets 🐶',
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIME_SLOTS = ['Morning ☀️', 'Afternoon 🌤️', 'Evening 🌙', 'Night 🌑'];

const OnboardingPage = () => {
  const { user, fetchProfile } = useAuthStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: '',
    interested_in: '',
    phone: '',
    bio: '',
    preferred_days: [] as string[],
    preferred_times: [] as string[],
    interests: [] as string[],
  });

  const totalSteps = 4;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const toggleArray = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];

  const canProceed = () => {
    switch (step) {
      case 0: return form.name && form.age;
      case 1: return form.gender && form.interested_in;
      case 2: return form.preferred_days.length > 0 && form.preferred_times.length > 0;
      case 3: return form.interests.length >= 3;
      default: return false;
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);

    try {
      let profileImageUrl: string | null = null;

      if (imageFile) {
        const ext = imageFile.name.split('.').pop();
        const path = `${user.id}/avatar.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, imageFile, { upsert: true });
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
        profileImageUrl = urlData.publicUrl;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          name: form.name,
          age: parseInt(form.age),
          gender: form.gender,
          interested_in: form.interested_in,
          phone: form.phone,
          bio: form.bio,
          preferred_days: form.preferred_days,
          preferred_times: form.preferred_times,
          interests: form.interests,
          profile_image: profileImageUrl,
          onboarding_completed: true,
        })
        .eq('user_id', user.id);

      if (error) throw error;
      await fetchProfile(user.id);
      toast({ title: 'Welcome to the herd! 🐑' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background px-6 py-8 safe-top">
      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= step ? 'bg-primary' : 'bg-border'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
          className="flex-1"
        >
          {step === 0 && (
            <div className="flex flex-col gap-6">
              <h2 className="text-2xl font-bold text-foreground">About You</h2>
              <p className="text-muted-foreground text-sm">Let's get to know you!</p>

              <div className="flex justify-center">
                <label className="relative w-24 h-24 rounded-full bg-secondary flex items-center justify-center cursor-pointer overflow-hidden">
                  {imagePreview ? (
                    <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-muted-foreground" />
                  )}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>

              <Input
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="h-12 rounded-2xl bg-card px-4"
              />
              <Input
                type="number"
                placeholder="Age"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                className="h-12 rounded-2xl bg-card px-4"
                min="18"
                max="99"
              />
              <Input
                placeholder="Short bio (optional)"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className="h-12 rounded-2xl bg-card px-4"
              />
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-6">
              <h2 className="text-2xl font-bold text-foreground">Preferences</h2>
              <p className="text-muted-foreground text-sm">Who do you want to meet?</p>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Your Gender</label>
                <div className="flex gap-3">
                  {['Male', 'Female', 'Other'].map((g) => (
                    <button
                      key={g}
                      onClick={() => setForm({ ...form, gender: g })}
                      className={`flex-1 h-12 rounded-2xl text-sm font-medium transition-colors ${
                        form.gender === g
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card text-foreground border border-border'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Interested In</label>
                <div className="flex gap-3">
                  {['Male', 'Female', 'Everyone'].map((g) => (
                    <button
                      key={g}
                      onClick={() => setForm({ ...form, interested_in: g })}
                      className={`flex-1 h-12 rounded-2xl text-sm font-medium transition-colors ${
                        form.interested_in === g
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card text-foreground border border-border'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <Input
                placeholder="Phone Number (optional)"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="h-12 rounded-2xl bg-card px-4"
              />
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-6">
              <h2 className="text-2xl font-bold text-foreground">Availability</h2>
              <p className="text-muted-foreground text-sm">When are you free to meet?</p>

              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">Preferred Days</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((day) => (
                    <button
                      key={day}
                      onClick={() => setForm({ ...form, preferred_days: toggleArray(form.preferred_days, day) })}
                      className={`px-4 py-2 rounded-2xl text-sm font-medium transition-colors ${
                        form.preferred_days.includes(day)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card text-foreground border border-border'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">Preferred Time</label>
                <div className="flex flex-wrap gap-2">
                  {TIME_SLOTS.map((time) => (
                    <button
                      key={time}
                      onClick={() => setForm({ ...form, preferred_times: toggleArray(form.preferred_times, time) })}
                      className={`px-4 py-2 rounded-2xl text-sm font-medium transition-colors ${
                        form.preferred_times.includes(time)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card text-foreground border border-border'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-6">
              <h2 className="text-2xl font-bold text-foreground">Interests</h2>
              <p className="text-muted-foreground text-sm">Pick at least 3 things you love</p>

              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => setForm({ ...form, interests: toggleArray(form.interests, interest) })}
                    className={`px-4 py-2.5 rounded-2xl text-sm font-medium transition-colors ${
                      form.interests.includes(interest)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card text-foreground border border-border'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{form.interests.length} selected</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-3 pt-6 safe-bottom">
        {step > 0 && (
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            className="h-12 rounded-2xl flex-1"
          >
            Back
          </Button>
        )}
        {step < totalSteps - 1 ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
            className="h-12 rounded-2xl flex-1"
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleComplete}
            disabled={!canProceed() || loading}
            className="h-12 rounded-2xl flex-1"
          >
            {loading ? 'Saving...' : 'Join the Herd 🐑'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;
