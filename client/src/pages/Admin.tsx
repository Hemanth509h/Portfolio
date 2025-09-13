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
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { LogOut, Save, X } from "lucide-react";

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
  const [, navigate] = useLocation();
  const [skillInput, setSkillInput] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check authentication
  useEffect(() => {
    const session = localStorage.getItem("adminSession");
    if (!session) {
      navigate("/admin/login");
    }
  }, [navigate]);

  // Fetch portfolio data
  const { data: portfolioData, isLoading: isLoadingData } = useQuery({
    queryKey: ["/api/portfolio"],
    queryFn: async () => {
      const response = await apiRequest("/api/portfolio");
      return response;
    },
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
    if (portfolioData) {
      form.reset({
        name: portfolioData.name || "",
        role: portfolioData.role || "",
        bio: portfolioData.bio || "",
        email: portfolioData.email || "",
        phone: portfolioData.phone || "",
        location: portfolioData.location || "",
        githubUrl: portfolioData.githubUrl || "",
        linkedinUrl: portfolioData.linkedinUrl || "",
        websiteUrl: portfolioData.websiteUrl || "",
        resumeUrl: portfolioData.resumeUrl || "",
        skills: portfolioData.skills || [],
        projects: portfolioData.projects || "[]",
      });
    }
  }, [portfolioData, form]);

  // Update portfolio mutation
  const updatePortfolioMutation = useMutation({
    mutationFn: async (data: PortfolioForm) => {
      const session = localStorage.getItem("adminSession");
      if (!session) {
        throw new Error("Not authenticated");
      }

      return await apiRequest("/api/admin/portfolio", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${session}`,
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
      if (error.message === "Unauthorized" || error.message === "Session expired") {
        localStorage.removeItem("adminSession");
        navigate("/admin/login");
        return;
      }
      toast({
        title: "Update failed",
        description: error.message || "Failed to update portfolio data",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PortfolioForm) => {
    updatePortfolioMutation.mutate(data);
  };

  const handleLogout = async () => {
    const session = localStorage.getItem("adminSession");
    if (session) {
      try {
        await apiRequest("/api/admin/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session}`,
          },
        });
      } catch (error) {
        // Ignore logout errors
      }
    }
    localStorage.removeItem("adminSession");
    navigate("/admin/login");
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
          <Button onClick={handleLogout} variant="outline" data-testid="button-logout">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

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
                          <Input {...field} placeholder="Your full name" data-testid="input-name" />
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
                          <Input {...field} placeholder="Your job title" data-testid="input-role" />
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
                          <Input {...field} type="email" placeholder="your@email.com" data-testid="input-email" />
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
                          <Input {...field} placeholder="+1 (555) 123-4567" data-testid="input-phone" />
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
                        <Input {...field} placeholder="City, Country" data-testid="input-location" />
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
                          <Input {...field} placeholder="https://github.com/yourusername" data-testid="input-github" />
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
                          <Input {...field} placeholder="https://linkedin.com/in/yourprofile" data-testid="input-linkedin" />
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
                          <Input {...field} placeholder="https://yourwebsite.com" data-testid="input-website" />
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
                          <Input {...field} placeholder="https://yourresume.pdf" data-testid="input-resume" />
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
                    data-testid="input-skill"
                  />
                  <Button type="button" onClick={addSkill} data-testid="button-add-skill">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.watch("skills").map((skill, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => removeSkill(skill)}
                        data-testid={`button-remove-skill-${index}`}
                      />
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Projects */}
            <Card>
              <CardHeader>
                <CardTitle>Projects (JSON)</CardTitle>
                <CardDescription>
                  Project data in JSON format. Each project should have: id, title, description, technologies, githubUrl, liveUrl, imageUrl
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="projects"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Projects JSON</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder='[{"id": "1", "title": "Project Name", "description": "Project description", "technologies": ["React", "TypeScript"], "githubUrl": "", "liveUrl": "", "imageUrl": ""}]'
                          className="min-h-[200px] font-mono text-sm"
                          data-testid="input-projects"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={updatePortfolioMutation.isPending}
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