import { useAuthStore } from '@/stores/authStore';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const ProfilePage = () => {
  const { profile, signOut } = useAuthStore();

  return (
    <div className="flex flex-col min-h-screen bg-background safe-top pb-20">
      <div className="px-5 py-4">
        <h1 className="text-xl font-bold text-foreground">Profile</h1>
      </div>

      <div className="flex-1 px-5">
        {/* Avatar & Name */}
        <div className="flex flex-col items-center mb-6">
          <Avatar className="w-24 h-24 mb-3">
            <AvatarImage src={profile?.profile_image || ''} />
            <AvatarFallback className="bg-secondary text-secondary-foreground text-2xl">
              {(profile?.name || '?')[0]}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-lg font-bold text-foreground">
            {profile?.name}{profile?.age ? `, ${profile.age}` : ''}
          </h2>
          {profile?.bio && (
            <p className="text-sm text-muted-foreground mt-1 text-center max-w-[260px]">{profile.bio}</p>
          )}
        </div>

        {/* Info cards */}
        <div className="space-y-4">
          {profile?.gender && (
            <div className="bg-card rounded-2xl border border-border p-4">
              <p className="text-xs text-muted-foreground mb-1">Gender</p>
              <p className="text-sm font-medium text-foreground capitalize">{profile.gender}</p>
            </div>
          )}

          {profile?.interested_in && (
            <div className="bg-card rounded-2xl border border-border p-4">
              <p className="text-xs text-muted-foreground mb-1">Interested In</p>
              <p className="text-sm font-medium text-foreground capitalize">{profile.interested_in}</p>
            </div>
          )}

          {profile?.interests && profile.interests.length > 0 && (
            <div className="bg-card rounded-2xl border border-border p-4">
              <p className="text-xs text-muted-foreground mb-2">Interests</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.interests.map((interest) => (
                  <Badge key={interest} variant="secondary" className="rounded-full text-xs">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {profile?.preferred_days && profile.preferred_days.length > 0 && (
            <div className="bg-card rounded-2xl border border-border p-4">
              <p className="text-xs text-muted-foreground mb-2">Preferred Days</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.preferred_days.map((day) => (
                  <Badge key={day} variant="secondary" className="rounded-full text-xs">
                    {day}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Logout */}
        <Button
          onClick={signOut}
          variant="outline"
          className="w-full mt-6 rounded-2xl h-11 text-destructive border-destructive/30"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Log Out
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default ProfilePage;
