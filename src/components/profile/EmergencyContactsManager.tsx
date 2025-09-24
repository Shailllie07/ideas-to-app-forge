import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, User, Phone, Edit, Trash2, Star, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface EmergencyContact {
  id: string;
  name: string;
  phone_number: string;
  relationship: string;
  is_primary: boolean;
  email?: string;
  notes?: string;
}

const EmergencyContactsManager = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    phone_number: "",
    relationship: "",
    is_primary: false,
    email: "",
    notes: ""
  });

  const relationships = [
    "Spouse/Partner",
    "Parent", 
    "Child",
    "Sibling",
    "Friend",
    "Doctor",
    "Neighbor",
    "Colleague",
    "Other"
  ];

  useEffect(() => {
    fetchEmergencyContacts();
  }, []);

  const fetchEmergencyContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch emergency contacts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone_number: "",
      relationship: "",
      is_primary: false,
      email: "",
      notes: ""
    });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.phone_number || !formData.relationship) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      // If setting as primary, remove primary status from other contacts
      if (formData.is_primary) {
        await supabase
          .from('emergency_contacts')
          .update({ is_primary: false })
          .neq('id', editingContact?.id || '');
      }

      if (editingContact) {
        // Update existing contact
        const { error } = await supabase
          .from('emergency_contacts')
          .update({
            name: formData.name,
            phone_number: formData.phone_number,
            relationship: formData.relationship,
            is_primary: formData.is_primary,
            email: formData.email || null,
            notes: formData.notes || null
          })
          .eq('id', editingContact.id);

        if (error) throw error;
        
        toast({
          title: "Contact Updated",
          description: "Emergency contact updated successfully",
        });
      } else {
        // Add new contact
        const { error } = await supabase
          .from('emergency_contacts')
          .insert({
            user_id: user?.id,
            name: formData.name,
            phone_number: formData.phone_number,
            relationship: formData.relationship,
            is_primary: formData.is_primary,
            email: formData.email || null,
            notes: formData.notes || null
          });

        if (error) throw error;
        
        toast({
          title: "Contact Added",
          description: "Emergency contact added successfully",
        });
      }

      setIsAddingContact(false);
      setEditingContact(null);
      resetForm();
      fetchEmergencyContacts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save emergency contact",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      phone_number: contact.phone_number,
      relationship: contact.relationship,
      is_primary: contact.is_primary,
      email: contact.email || "",
      notes: contact.notes || ""
    });
    setIsAddingContact(true);
  };

  const handleDelete = async (contactId: string) => {
    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;
      
      toast({
        title: "Contact Deleted",
        description: "Emergency contact removed successfully",
      });
      
      fetchEmergencyContacts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete emergency contact",
        variant: "destructive"
      });
    }
  };

  const setPrimary = async (contactId: string) => {
    try {
      // Remove primary status from all contacts
      await supabase
        .from('emergency_contacts')
        .update({ is_primary: false })
        .neq('id', contactId);

      // Set new primary contact
      const { error } = await supabase
        .from('emergency_contacts')
        .update({ is_primary: true })
        .eq('id', contactId);

      if (error) throw error;
      
      toast({
        title: "Primary Contact Updated",
        description: "Primary emergency contact has been updated",
      });
      
      fetchEmergencyContacts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update primary contact",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setIsAddingContact(false);
    setEditingContact(null);
    resetForm();
  };

  if (loading) {
    return <div className="flex items-center justify-center py-8">Loading contacts...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Emergency Contacts</h2>
          <p className="text-muted-foreground">Manage your emergency contacts for safety</p>
        </div>
        
        <Dialog open={isAddingContact} onOpenChange={setIsAddingContact}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-primary-glow">
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingContact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="relationship">Relationship *</Label>
                <Select 
                  value={formData.relationship} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, relationship: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {relationships.map((rel) => (
                      <SelectItem key={rel} value={rel}>{rel}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="john@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional information..."
                  rows={2}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="primary"
                  checked={formData.is_primary}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_primary: checked }))}
                />
                <Label htmlFor="primary">Set as primary contact</Label>
              </div>

              <Separator />

              <div className="flex items-center gap-2">
                <Button onClick={handleSave} className="flex-1">
                  {editingContact ? 'Update Contact' : 'Add Contact'}
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Emergency Contacts List */}
      <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
        <CardContent className="p-6">
          {contacts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center">
                <User className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-2">No emergency contacts</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Add trusted contacts who can help you during emergencies
              </p>
              <Button
                onClick={() => setIsAddingContact(true)}
                className="bg-gradient-to-r from-primary to-primary-glow"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Contact
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {contacts.map((contact) => (
                <div key={contact.id} className="p-4 border border-border/50 rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary-glow rounded-full flex items-center justify-center text-primary-foreground font-bold">
                        {contact.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold">{contact.name}</h4>
                          {contact.is_primary && (
                            <Badge className="bg-accent text-accent-foreground">
                              <Star className="w-3 h-3 mr-1" />
                              Primary
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {contact.phone_number}
                          </div>
                          {contact.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {contact.email}
                            </div>
                          )}
                        </div>
                        {contact.notes && (
                          <p className="text-xs text-muted-foreground mt-2 italic">
                            "{contact.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!contact.is_primary && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPrimary(contact.id)}
                        >
                          <Star className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(contact)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Emergency Contact</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {contact.name} from your emergency contacts? 
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(contact.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Delete Contact
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information Card */}
      {contacts.length > 0 && (
        <Card className="border-0 shadow-lg bg-card/80 backdrop-blur border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 text-primary" />
              </div>
              <div className="text-sm">
                <p className="font-medium text-primary mb-1">Emergency Contact Tips</p>
                <ul className="text-muted-foreground space-y-1 text-xs">
                  <li>• Set one contact as primary for fastest emergency access</li>
                  <li>• Ensure phone numbers are current and reachable</li>
                  <li>• Add notes about best times to reach each contact</li>
                  <li>• Inform your contacts that they're listed as emergency contacts</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmergencyContactsManager;