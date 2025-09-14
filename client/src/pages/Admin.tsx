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
import { Save, X, Lock, Unlock, Code, Eye, EyeOff, Plus, Trash2, Zap } from "lucide-react";

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
  workExperience: z.string().default('[]'),
  education: z.string().default('[]'),
});

type PortfolioForm = z.infer<typeof portfolioSchema>;

export default function Admin() {
  const [codeInput, setCodeInput] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [showProjectPreview, setShowProjectPreview] = useState(false);
  const [showWorkExperiencePreview, setShowWorkExperiencePreview] = useState(false);
  const [showEducationPreview, setShowEducationPreview] = useState(false);
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
  const [showSkillPreview, setShowSkillPreview] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check admin session status on mount
  useEffect(() => {
    checkSessionStatus();
  }, []);
  
  const checkSessionStatus = async () => {
    try {
      const response = await apiRequest("/api/admin/session", {
        method: "GET",
        credentials: "include",
      });
      
      if (response.authenticated) {
        setIsAuthenticated(true);
        setSessionInfo(response);
      } else {
        setIsAuthenticated(false);
        setSessionInfo(null);
      }
    } catch (error) {
      console.error("Session check failed:", error);
      setIsAuthenticated(false);
      setSessionInfo(null);
    } finally {
      setIsCheckingSession(false);
    }
  };

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
      workExperience: "[]",
      education: "[]",
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
        workExperience: (portfolioData as any).workExperience || "[]",
        education: (portfolioData as any).education || "[]",
      });
    }
  }, [portfolioData, form]);

  // Admin login mutation
  const loginMutation = useMutation({
    mutationFn: async (code: string) => {
      return await apiRequest("/api/admin/login", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ code }),
      });
    },
    onSuccess: (response) => {
      setIsAuthenticated(true);
      setSessionInfo(response.sessionInfo);
      setCodeInput("");
      toast({
        title: "Login successful",
        description: "You are now logged in to the admin panel",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid admin credentials",
        variant: "destructive",
      });
    },
  });
  
  // Admin logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });
    },
    onSuccess: () => {
      setIsAuthenticated(false);
      setSessionInfo(null);
      toast({
        title: "Logged out",
        description: "You have been logged out of the admin panel",
      });
    },
    onError: (error: any) => {
      console.error("Logout error:", error);
      // Even if logout fails, clear local state
      setIsAuthenticated(false);
      setSessionInfo(null);
    },
  });

  // Update portfolio mutation
  const updatePortfolioMutation = useMutation({
    mutationFn: async (data: PortfolioForm) => {
      return await apiRequest("/api/admin/portfolio", {
        method: "PUT",
        credentials: "include",
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
      if (error.message.includes("session") || error.message.includes("expired")) {
        setIsAuthenticated(false);
        setSessionInfo(null);
        toast({
          title: "Session expired",
          description: "Please log in again",
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

  const handleLogin = () => {
    if (codeInput.trim()) {
      loginMutation.mutate(codeInput.trim());
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loginMutation.isPending) {
      e.preventDefault();
      handleLogin();
    }
  };

  const onSubmit = (data: PortfolioForm) => {
    if (!isAuthenticated) {
      toast({
        title: "Access denied",
        description: "Please log in to the admin panel first",
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

  // Work Experience Helper Functions
  const formatWorkExperienceJSON = () => {
    try {
      const currentWorkExperience = form.getValues("workExperience");
      const parsed = JSON.parse(currentWorkExperience || '[]');
      const formatted = JSON.stringify(parsed, null, 2);
      form.setValue("workExperience", formatted);
      toast({
        title: "JSON formatted",
        description: "Work experience JSON has been formatted successfully",
      });
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "Please check your JSON syntax and try again",
        variant: "destructive",
      });
    }
  };

  const validateWorkExperienceJSON = (jsonString: string) => {
    if (!jsonString.trim()) return [];
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) {
        throw new Error('Work experience must be an array');
      }
      return parsed;
    } catch (error) {
      throw error;
    }
  };

  const getWorkExperiencePreview = () => {
    try {
      const workExperience = validateWorkExperienceJSON(form.watch("workExperience") || '[]');
      return workExperience;
    } catch (error) {
      return [];
    }
  };

  // Education Helper Functions
  const formatEducationJSON = () => {
    try {
      const currentEducation = form.getValues("education");
      const parsed = JSON.parse(currentEducation || '[]');
      const formatted = JSON.stringify(parsed, null, 2);
      form.setValue("education", formatted);
      toast({
        title: "JSON formatted",
        description: "Education JSON has been formatted successfully",
      });
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "Please check your JSON syntax and try again",
        variant: "destructive",
      });
    }
  };

  const validateEducationJSON = (jsonString: string) => {
    if (!jsonString.trim()) return [];
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) {
        throw new Error('Education must be an array');
      }
      return parsed;
    } catch (error) {
      throw error;
    }
  };

  const getEducationPreview = () => {
    try {
      const education = validateEducationJSON(form.watch("education") || '[]');
      return education;
    } catch (error) {
      return [];
    }
  };

  // Skills Helper Functions and Suggestions
  const skillSuggestions = {
    "Frontend": [
      "React", "Vue.js", "Angular", "TypeScript", "JavaScript", "HTML5", "CSS3", 
      "Tailwind CSS", "Bootstrap", "Sass", "Next.js", "Nuxt.js", "Svelte"
    ],
    "Backend": [
      "Node.js", "Express.js", "Python", "Django", "Flask", "Java", "Spring Boot",
      "PHP", "Laravel", "Ruby", "Rails", "C#", ".NET", "Go", "Rust"
    ],
    "Databases": [
      "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Firebase", 
      "Supabase", "DynamoDB", "Elasticsearch", "Oracle"
    ],
    "Cloud & DevOps": [
      "AWS", "Google Cloud", "Azure", "Docker", "Kubernetes", "Jenkins", 
      "GitLab CI", "GitHub Actions", "Terraform", "Ansible"
    ],
    "Mobile": [
      "React Native", "Flutter", "Swift", "Kotlin", "Ionic", "Xamarin", "Unity"
    ],
    "Tools & Others": [
      "Git", "Linux", "Figma", "Photoshop", "Webpack", "Vite", "Jest", 
      "Cypress", "GraphQL", "REST APIs", "Microservices", "Agile", "Scrum"
    ]
  };

  const addSuggestedSkill = (skill: string) => {
    const currentSkills = form.getValues("skills");
    if (!currentSkills.includes(skill)) {
      form.setValue("skills", [...currentSkills, skill]);
      toast({
        title: "Skill added",
        description: `${skill} has been added to your skills`,
      });
    }
  };

  const addSkillCategory = (category: string) => {
    const currentSkills = form.getValues("skills");
    const categorySkills = skillSuggestions[category as keyof typeof skillSuggestions] || [];
    const newSkills = categorySkills.filter(skill => !currentSkills.includes(skill));
    
    if (newSkills.length > 0) {
      form.setValue("skills", [...currentSkills, ...newSkills]);
      toast({
        title: "Skills added",
        description: `Added ${newSkills.length} skills from ${category} category`,
      });
    } else {
      toast({
        title: "No new skills",
        description: `All ${category} skills are already in your list`,
        variant: "destructive",
      });
    }
  };

  const clearAllSkills = () => {
    form.setValue("skills", []);
    toast({
      title: "Skills cleared",
      description: "All skills have been removed",
    });
  };

  const getSkillsPreview = () => {
    const skills = form.watch("skills") || [];
    return skills;
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
          
          {!isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Enter admin code"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                onKeyPress={handleKeyPress}
                data-testid="input-admin-code"
                className="w-40"
              />
              <Button onClick={handleLogin} disabled={loginMutation.isPending} data-testid="button-login">
                {loginMutation.isPending ? "Logging in..." : "Login"}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Unlock className="w-4 h-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Admin access granted</span>
              <Button onClick={handleLogout} variant="outline" size="sm" disabled={logoutMutation.isPending} data-testid="button-logout">
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </Button>
            </div>
          )}
        </div>

        {!isAuthenticated && (
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
                          <Input {...field} placeholder="Your full name" disabled={!isAuthenticated} data-testid="input-name" />
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
                          <Input {...field} placeholder="Your job title" disabled={!isAuthenticated} data-testid="input-role" />
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
                          disabled={!isAuthenticated}
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
                          <Input {...field} type="email" placeholder="your@email.com" disabled={!isAuthenticated} data-testid="input-email" />
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
                          <Input {...field} placeholder="+1 (555) 123-4567" disabled={!isAuthenticated} data-testid="input-phone" />
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
                        <Input {...field} placeholder="City, Country" disabled={!isAuthenticated} data-testid="input-location" />
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
                          <Input {...field} placeholder="https://github.com/yourusername" disabled={!isAuthenticated} data-testid="input-github" />
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
                          <Input {...field} placeholder="https://linkedin.com/in/yourprofile" disabled={!isAuthenticated} data-testid="input-linkedin" />
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
                          <Input {...field} placeholder="https://yourwebsite.com" disabled={!isAuthenticated} data-testid="input-website" />
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
                          <Input {...field} placeholder="https://yourresume.pdf" disabled={!isAuthenticated} data-testid="input-resume" />
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
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Skills & Typewriter Effect
                </CardTitle>
                <CardDescription>
                  Technologies and skills you work with. These skills will appear in the animated typewriter effect on your homepage hero section.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={handleSkillKeyPress}
                    placeholder="Add a skill..."
                    disabled={!isAuthenticated}
                    data-testid="input-skill"
                  />
                  <Button type="button" onClick={addSkill} disabled={!isAuthenticated} data-testid="button-add-skill">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.watch("skills").map((skill, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      {isAuthenticated && (
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
                      disabled={!isAuthenticated}
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
                          disabled={!isAuthenticated}
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

            {/* Work Experience */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Work Experience
                  <div className="flex gap-2 ml-auto">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={formatWorkExperienceJSON}
                      disabled={!isAuthenticated}
                      data-testid="button-format-work-experience-json"
                    >
                      <Code className="w-4 h-4 mr-1" />
                      Format JSON
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowWorkExperiencePreview(!showWorkExperiencePreview)}
                      data-testid="button-toggle-work-experience-preview"
                    >
                      {showWorkExperiencePreview ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                      {showWorkExperiencePreview ? 'Hide Preview' : 'Show Preview'}
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  Manage your work experience in JSON format. Each entry should include: id, company, position, startDate, endDate, description, location (optional)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="workExperience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Experience JSON</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder={JSON.stringify([
                            {
                              "id": "1",
                              "company": "Tech Company Inc.",
                              "position": "Senior Software Engineer",
                              "startDate": "2022-01",
                              "endDate": "present",
                              "description": "Led development of scalable web applications using React and Node.js. Mentored junior developers and improved team productivity by 30%.",
                              "location": "San Francisco, CA"
                            }
                          ], null, 2)}
                          className="min-h-[250px] font-mono text-sm"
                          disabled={!isAuthenticated}
                          data-testid="input-work-experience"
                        />
                      </FormControl>
                      <FormMessage />
                      <div className="text-xs text-muted-foreground mt-2">
                        💡 Tips: Use "present" for current positions. All fields except location are required.
                      </div>
                    </FormItem>
                  )}
                />
                
                {/* Work Experience Preview */}
                {showWorkExperiencePreview && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-3 text-sm">Work Experience Preview ({getWorkExperiencePreview().length} positions)</h4>
                    <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-3 bg-muted/30">
                      {getWorkExperiencePreview().length > 0 ? (
                        getWorkExperiencePreview().map((job: any, index: number) => (
                          <div key={index} className="text-xs bg-background rounded p-2 border">
                            <div className="font-medium truncate">{job.position || 'Untitled Position'}</div>
                            <div className="text-muted-foreground truncate">{job.company || 'Unknown Company'}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {job.startDate || 'Unknown start'} - {job.endDate || 'Unknown end'}
                              {job.location && ` • ${job.location}`}
                            </div>
                            {job.description && (
                              <div className="text-xs text-muted-foreground mt-1 truncate">
                                {job.description.slice(0, 100)}...
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-muted-foreground text-center py-4">
                          No valid work experience found. Check your JSON format above.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Education
                  <div className="flex gap-2 ml-auto">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={formatEducationJSON}
                      disabled={!isAuthenticated}
                      data-testid="button-format-education-json"
                    >
                      <Code className="w-4 h-4 mr-1" />
                      Format JSON
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowEducationPreview(!showEducationPreview)}
                      data-testid="button-toggle-education-preview"
                    >
                      {showEducationPreview ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                      {showEducationPreview ? 'Hide Preview' : 'Show Preview'}
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  Manage your education in JSON format. Each entry should include: id, institution, degree, field, startDate, endDate, description (optional)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="education"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Education JSON</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder={JSON.stringify([
                            {
                              "id": "1",
                              "institution": "University of Technology",
                              "degree": "Bachelor of Science",
                              "field": "Computer Science",
                              "startDate": "2018",
                              "endDate": "2022",
                              "description": "Focused on software engineering and data structures. Graduated magna cum laude."
                            }
                          ], null, 2)}
                          className="min-h-[250px] font-mono text-sm"
                          disabled={!isAuthenticated}
                          data-testid="input-education"
                        />
                      </FormControl>
                      <FormMessage />
                      <div className="text-xs text-muted-foreground mt-2">
                        💡 Tips: Use years for dates (e.g., "2022"). Description field is optional.
                      </div>
                    </FormItem>
                  )}
                />
                
                {/* Education Preview */}
                {showEducationPreview && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-3 text-sm">Education Preview ({getEducationPreview().length} entries)</h4>
                    <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-3 bg-muted/30">
                      {getEducationPreview().length > 0 ? (
                        getEducationPreview().map((education: any, index: number) => (
                          <div key={index} className="text-xs bg-background rounded p-2 border">
                            <div className="font-medium truncate">{education.degree || 'Unknown Degree'}</div>
                            <div className="text-muted-foreground truncate">
                              {education.field || 'Unknown Field'} • {education.institution || 'Unknown Institution'}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {education.startDate || 'Unknown start'} - {education.endDate || 'Unknown end'}
                            </div>
                            {education.description && (
                              <div className="text-xs text-muted-foreground mt-1 truncate">
                                {education.description.slice(0, 100)}...
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-muted-foreground text-center py-4">
                          No valid education found. Check your JSON format above.
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
                disabled={updatePortfolioMutation.isPending || !isAuthenticated}
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