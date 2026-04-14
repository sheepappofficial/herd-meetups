import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { LogOut, Edit2 } from 'lucide-react';

const ProfilePage = () => {
  const { profile, signOut } = useAuthStore();

  const interestsList = profile?.interests || [];

  return (
    <div className="flex flex-col min-h-screen bg-background safe-top pb-20">
      {/* Header */}
      <div className="px-5 py-4">
        <h1 className="text-xl font-bold text-foreground">Profile</h1>
      </div>

      <div className="flex-1 px-5 space-y-6">
        {/* Avatar + Name */}
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-secondary overflow-hidden mb-3">
            {profile?.profile_image ? (
              <img
                src={profile.profile_image}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl">
                🐑
              </div>
            )}
          </div>
          <h2 className="text-lg font-bold text-foreground">
            {profile?.name || 'Sheep User'}
          </h2>
          {profile?.age && (
            <p className="text-sm text-muted-foreground">{profile.age} years old</p>
          )}
          {profile?.bio && (
            <p className="text-sm text-muted-foreground mt-1 text-center max-w-xs">
              {profile.bio}
            </p>
          )}
        </div>

        {/* Info cards */}
        <div className="space-y-3">
          {profile?.gender && (
            <div className="bg-card rounded-2xl p-4 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Gender</p>
              <p className="text-sm font-medium text-foreground capitalize">{profile.gender}</p>
            </div>
          )}

          {profile?.interested_in && (
            <div className="bg-card rounded-2xl p-4 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Interested In</p>
              <p className="text-sm font-medium text-foreground capitalize">{profile.interested_in}</p>
            </div>
          )}

          {interestsList.length > 0 && (
            <div className="bg-card rounded-2xl p-4 border border-border">
              <p className="text-xs text-muted-foreground mb-2">Interests</p>
              <div className="flex flex-wrap gap-2">
                {interestsList.map((interest) => (
                  <span
                    key={interest}
                    className="text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(profile?.preferred_days?.length ?? 0) > 0 && (
            <div className="bg-card rounded-2xl p-4 border border-border">
              <p className="text-xs text-muted-foreground mb-2">Preferred Days</p>
              <div className="flex flex-wrap gap-2">
                {profile!.preferred_days.map((d) => (
                  <span
                    key={d}
                    className="text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Logout */}
        <Button
          variant="outline"
          onClick={signOut}
          className="w-full h-12 rounded-2xl gap-2 text-destructive border-destructive/20"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default ProfilePage;
