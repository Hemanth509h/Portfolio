import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Save, X, Lock, Unlock, Code, Eye, EyeOff } from "lucide-react";

const portfolioSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  role: z.string().min(1, "Role is required").max(100, "Role too long"),
  bio: z.string().min(1, "Bio is required").max(1000, "Bio too long"),
  email: z.string().email("Invalid email").max(254, "Email too long"),
  phone: z.string().optional(),
  location: z.string().optional(),
  githubUrl: z.string().url("Invalid GitHub URL").optional().or(z.literal("")),
  linkedinUrl: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
  websiteUrl: z.string().url("Invalid website URL").optional().or(z.literal("")),
  resumeUrl: z.string().url("Invalid resume URL").optional().or(z.literal("")),
  skills: z.array(z.string()).default([]),
  projects: z.string().default('[]'),
});

type PortfolioForm = z.infer<typeof portfolioSchema>;

export default function Admin() {
  const [adminCode, setAdminCode] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [showProjectPreview, setShowProjectPreview] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check for admin code in URL or localStorage on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const codeFromUrl = urlParams.get('code');
    const codeFromStorage = localStorage.getItem('adminCode');
    
    if (codeFromUrl) {
      setAdminCode(codeFromUrl);
      setIsUnlocked(true);
      localStorage.setItem('adminCode', codeFromUrl);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (codeFromStorage) {
      setAdminCode(codeFromStorage);
      setIsUnlocked(true);
    }
  }, []);

  // Fetch portfolio data
  const { data: portfolioData, isLoading: isLoadingData } = useQuery({
    queryKey: ["/api/portfolio"],
  });

  const form = useForm<PortfolioForm>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: {
      name: "",
      role: "",
      bio: "",
      email: "",
      phone: "",
      location: "",
      githubUrl: "",
      linkedinUrl: "",
      websiteUrl: "",
      resumeUrl: "",
      skills: [],
      projects: "[]",
    },
  });

  // Update form when data is loaded
  useEffect(() => {
    if (portfolioData && typeof portfolioData === 'object') {
      form.reset({
        name: (portfolioData as any).name || "",
        role: (portfolioData as any).role || "",
        bio: (portfolioData as any).bio || "",
        email: (portfolioData as any).email || "",
        phone: (portfolioData as any).phone || "",
        location: (portfolioData as any).location || "",
        githubUrl: (portfolioData as any).githubUrl || "",
        linkedinUrl: (portfolioData as any).linkedinUrl || "",
        websiteUrl: (portfolioData as any).websiteUrl || "",
        resumeUrl: (portfolioData as any).resumeUrl || "",
        skills: (portfolioData as any).skills || [],
        projects: (portfolioData as any).projects || "[]",
      });
    }
  }, [portfolioData, form]);

  // Update portfolio mutation
  const updatePortfolioMutation = useMutation({
    mutationFn: async (data: PortfolioForm) => {
      return await apiRequest("/api/admin/portfolio", {
        method: "PUT",
        headers: {
          "X-Admin-Code": adminCode,
        },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Portfolio updated",
        description: "Your portfolio data has been saved successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
    },
    onError: (error: any) => {
      if (error.message.includes("Invalid admin code")) {
        setIsUnlocked(false);
        setAdminCode("");
        localStorage.removeItem('adminCode');
        toast({
          title: "Invalid admin code",
          description: "Please enter the correct admin code",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Update failed",
        description: error.message || "Failed to update portfolio data",
        variant: "destructive",
      });
    },
  });

  const handleUnlock = () => {
    if (codeInput.trim()) {
      setAdminCode(codeInput.trim());
      setIsUnlocked(true);
      localStorage.setItem('adminCode', codeInput.trim());
      setCodeInput("");
      toast({
        title: "Admin panel unlocked",
        description: "You can now edit portfolio data",
      });
    }
  };

  const handleClearCode = () => {
    setAdminCode("");
    setIsUnlocked(false);
    localStorage.removeItem('adminCode');
    toast({
      title: "Admin panel locked",
      description: "Enter admin code to edit portfolio data",
    });
  };

  const onSubmit = (data: PortfolioForm) => {
    if (!isUnlocked || !adminCode) {
      toast({
        title: "Access denied",
        description: "Please unlock admin panel first",
        variant: "destructive",
      });
      return;
    }
    updatePortfolioMutation.mutate(data);
  };

  const addSkill = () => {
    if (skillInput.trim()) {
      const currentSkills = form.getValues("skills");
      if (!currentSkills.includes(skillInput.trim())) {
        form.setValue("skills", [...currentSkills, skillInput.trim()]);
        setSkillInput("");
      }
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const currentSkills = form.getValues("skills");
    form.setValue("skills", currentSkills.filter(skill => skill !== skillToRemove));
  };

  const handleSkillKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const formatProjectsJSON = () => {
    try {
      const currentProjects = form.getValues("projects");
      const parsed = JSON.parse(currentProjects || '[]');
      const formatted = JSON.stringify(parsed, null, 2);
      form.setValue("projects", formatted);
      toast({
        title: "JSON formatted",
        description: "Projects JSON has been formatted successfully",
      });
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "Please check your JSON syntax and try again",
        variant: "destructive",
      });
    }
  };

  const validateProjectsJSON = (jsonString: string) => {
    if (!jsonString.trim()) return [];
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) {
        throw new Error('Projects must be an array');
      }
      return parsed;
    } catch (error) {
      throw error;
    }
  };

  const getProjectsPreview = () => {
    try {
      const projects = validateProjectsJSON(form.watch("projects") || '[]');
      return projects;
    } catch (error) {
      return [];
    }
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">Loading admin panel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">Manage your portfolio content</p>
          </div>
          
          {!isUnlocked ? (
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Enter admin code"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleUnlock()}
                data-testid="input-admin-code"
                className="w-40"
              />
              <Button onClick={handleUnlock} data-testid="button-unlock">
                Unlock
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Unlock className="w-4 h-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Admin access granted</span>
              <Button onClick={handleClearCode} variant="outline" size="sm" data-testid="button-clear-code">
                Clear Code
              </Button>
            </div>
          )}
        </div>

        {!isUnlocked && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Admin Access Required</CardTitle>
              <CardDescription>
                Enter the admin code to edit portfolio data. You can also access directly with: /admin?code=YOUR_CODE
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Basic information about yourself</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Your full name" disabled={!isUnlocked} data-testid="input-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Your job title" disabled={!isUnlocked} data-testid="input-role" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Tell us about yourself..."
                          className="min-h-[100px]"
                          disabled={!isUnlocked}
                          data-testid="input-bio"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="your@email.com" disabled={!isUnlocked} data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="+1 (555) 123-4567" disabled={!isUnlocked} data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="City, Country" disabled={!isUnlocked} data-testid="input-location" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
                <CardDescription>Your online presence and portfolio links</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="githubUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GitHub URL (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://github.com/yourusername" disabled={!isUnlocked} data-testid="input-github" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="linkedinUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn URL (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://linkedin.com/in/yourprofile" disabled={!isUnlocked} data-testid="input-linkedin" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="websiteUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website URL (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://yourwebsite.com" disabled={!isUnlocked} data-testid="input-website" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="resumeUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Resume URL (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://yourresume.pdf" disabled={!isUnlocked} data-testid="input-resume" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
                <CardDescription>Technologies and skills you work with</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={handleSkillKeyPress}
                    placeholder="Add a skill..."
                    disabled={!isUnlocked}
                    data-testid="input-skill"
                  />
                  <Button type="button" onClick={addSkill} disabled={!isUnlocked} data-testid="button-add-skill">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.watch("skills").map((skill, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      {isUnlocked && (
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => removeSkill(skill)}
                          data-testid={`button-remove-skill-${index}`}
                        />
                      )}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Projects */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Projects 
                  <div className="flex gap-2 ml-auto">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={formatProjectsJSON}
                      disabled={!isUnlocked}
                      data-testid="button-format-json"
                    >
                      <Code className="w-4 h-4 mr-1" />
                      Format JSON
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowProjectPreview(!showProjectPreview)}
                      data-testid="button-toggle-preview"
                    >
                      {showProjectPreview ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                      {showProjectPreview ? 'Hide Preview' : 'Show Preview'}
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  Manage your projects in JSON format. Each project should include: id, title, description, technologies (array), githubUrl, liveUrl, imageUrl (optional)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="projects"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Projects JSON</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder={JSON.stringify([
                            {
                              "id": "1",
                              "title": "My Awesome Project",
                              "description": "A detailed description of what this project does and the problems it solves.",
                              "technologies": ["React", "TypeScript", "Node.js"],
                              "githubUrl": "https://github.com/username/project",
                              "liveUrl": "https://myproject.com",
                              "imageUrl": "https://images.unsplash.com/photo-1234567890123"
                            }
                          ], null, 2)}
                          className="min-h-[250px] font-mono text-sm"
                          disabled={!isUnlocked}
                          data-testid="input-projects"
                        />
                      </FormControl>
                      <FormMessage />
                      <div className="text-xs text-muted-foreground mt-2">
                        💡 Tips: Use the "Format JSON" button to properly format your JSON. All fields except imageUrl are required.
                      </div>
                    </FormItem>
                  )}
                />
                
                {/* Project Preview */}
                {showProjectPreview && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-3 text-sm">Projects Preview ({getProjectsPreview().length} projects)</h4>
                    <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-3 bg-muted/30">
                      {getProjectsPreview().length > 0 ? (
                        getProjectsPreview().map((project: any, index: number) => (
                          <div key={index} className="text-xs bg-background rounded p-2 border">
                            <div className="font-medium truncate">{project.title || 'Untitled'}</div>
                            <div className="text-muted-foreground truncate mt-1">
                              {project.description || 'No description'}
                            </div>
                            {project.technologies && project.technologies.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {project.technologies.slice(0, 3).map((tech: string, techIndex: number) => (
                                  <span key={techIndex} className="bg-primary/10 text-primary px-1 rounded text-xs">
                                    {tech}
                                  </span>
                                ))}
                                {project.technologies.length > 3 && (
                                  <span className="text-muted-foreground text-xs">+{project.technologies.length - 3} more</span>
                                )}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-muted-foreground text-center py-4">
                          No valid projects found. Check your JSON format above.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={updatePortfolioMutation.isPending || !isUnlocked}
                data-testid="button-save"
              >
                <Save className="w-4 h-4 mr-2" />
                {updatePortfolioMutation.isPending ? "Saving..." : "Save Portfolio"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}