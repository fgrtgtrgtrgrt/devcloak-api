import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  User, 
  Bell, 
  Shield, 
  Webhook, 
  Save,
  Eye,
  EyeOff
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Settings = () => {
  const { user } = useAuth();
  const [showWebhook, setShowWebhook] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    executionAlerts: true,
    failedAuthAlerts: true,
    weeklyReports: false,
    discordWebhook: "",
    twoFactorEnabled: false,
  });

  const handleSave = () => {
    // In a real app, this would save to the database
    toast.success("Settings saved successfully!");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your account preferences and notifications
            </p>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="webhooks" className="flex items-center gap-2">
                <Webhook className="w-4 h-4" />
                Webhooks
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <div className="glass-card p-6 space-y-6">
                <h2 className="text-xl font-semibold text-foreground">Profile Information</h2>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      value={user?.email || ""} 
                      disabled 
                      className="bg-secondary/50"
                    />
                    <p className="text-xs text-muted-foreground">
                      Contact support to change your email address
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input 
                      id="displayName" 
                      placeholder="Enter your display name"
                      className="bg-secondary/50 border-border/50 focus:border-primary"
                    />
                  </div>
                </div>

                <Button variant="hero" onClick={handleSave}>
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <div className="glass-card p-6 space-y-6">
                <h2 className="text-xl font-semibold text-foreground">Notification Preferences</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                    <div>
                      <p className="font-medium text-foreground">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive updates via email</p>
                    </div>
                    <Switch 
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                    <div>
                      <p className="font-medium text-foreground">Execution Alerts</p>
                      <p className="text-sm text-muted-foreground">Get notified on script executions</p>
                    </div>
                    <Switch 
                      checked={settings.executionAlerts}
                      onCheckedChange={(checked) => setSettings({...settings, executionAlerts: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                    <div>
                      <p className="font-medium text-foreground">Failed Auth Alerts</p>
                      <p className="text-sm text-muted-foreground">Alert on failed authentication attempts</p>
                    </div>
                    <Switch 
                      checked={settings.failedAuthAlerts}
                      onCheckedChange={(checked) => setSettings({...settings, failedAuthAlerts: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                    <div>
                      <p className="font-medium text-foreground">Weekly Reports</p>
                      <p className="text-sm text-muted-foreground">Receive weekly analytics summaries</p>
                    </div>
                    <Switch 
                      checked={settings.weeklyReports}
                      onCheckedChange={(checked) => setSettings({...settings, weeklyReports: checked})}
                    />
                  </div>
                </div>

                <Button variant="hero" onClick={handleSave}>
                  <Save className="w-4 h-4" />
                  Save Preferences
                </Button>
              </div>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <div className="glass-card p-6 space-y-6">
                <h2 className="text-xl font-semibold text-foreground">Security Settings</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                    <div>
                      <p className="font-medium text-foreground">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                    </div>
                    <Switch 
                      checked={settings.twoFactorEnabled}
                      onCheckedChange={(checked) => setSettings({...settings, twoFactorEnabled: checked})}
                    />
                  </div>

                  <div className="p-4 rounded-lg bg-secondary/30">
                    <p className="font-medium text-foreground mb-2">Change Password</p>
                    <p className="text-sm text-muted-foreground mb-4">Update your account password</p>
                    <Button variant="outline">Change Password</Button>
                  </div>

                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                    <p className="font-medium text-destructive mb-2">Danger Zone</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Delete your account and all associated data. This action cannot be undone.
                    </p>
                    <Button variant="destructive">Delete Account</Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Webhooks Tab */}
            <TabsContent value="webhooks">
              <div className="glass-card p-6 space-y-6">
                <h2 className="text-xl font-semibold text-foreground">Webhook Configuration</h2>
                <p className="text-muted-foreground">
                  Configure webhooks to receive real-time notifications about script events.
                </p>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="discordWebhook">Discord Webhook URL</Label>
                    <div className="relative">
                      <Input 
                        id="discordWebhook" 
                        type={showWebhook ? "text" : "password"}
                        placeholder="https://discord.com/api/webhooks/..."
                        value={settings.discordWebhook}
                        onChange={(e) => setSettings({...settings, discordWebhook: e.target.value})}
                        className="bg-secondary/50 border-border/50 focus:border-primary pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowWebhook(!showWebhook)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showWebhook ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Receive notifications in your Discord server
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-secondary/30">
                    <p className="font-medium text-foreground mb-2">Webhook Events</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Script executions (successful & failed)</li>
                      <li>• Key generation & usage</li>
                      <li>• Failed authentication attempts</li>
                      <li>• Blacklist triggers</li>
                    </ul>
                  </div>
                </div>

                <Button variant="hero" onClick={handleSave}>
                  <Save className="w-4 h-4" />
                  Save Webhook
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Settings;
