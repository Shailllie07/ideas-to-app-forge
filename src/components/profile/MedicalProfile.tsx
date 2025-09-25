import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Heart, Plus, X, Save, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface MedicalInfo {
  medical_allergies: string[];
  medical_conditions: string[];
  medical_medications: string[];
  blood_type: string | null;
  emergency_notes: string | null;
}

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const MedicalProfile = () => {
  const { user } = useAuth();
  const [medicalInfo, setMedicalInfo] = useState<MedicalInfo>({
    medical_allergies: [],
    medical_conditions: [],
    medical_medications: [],
    blood_type: null,
    emergency_notes: null
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Form state for adding new items
  const [newAllergy, setNewAllergy] = useState("");
  const [newCondition, setNewCondition] = useState("");
  const [newMedication, setNewMedication] = useState("");

  useEffect(() => {
    if (user) {
      fetchMedicalInfo();
    }
  }, [user]);

  const fetchMedicalInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('medical_allergies, medical_conditions, medical_medications, blood_type, emergency_notes')
        .eq('id', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setMedicalInfo({
          medical_allergies: data.medical_allergies || [],
          medical_conditions: data.medical_conditions || [],
          medical_medications: data.medical_medications || [],
          blood_type: data.blood_type,
          emergency_notes: data.emergency_notes
        });
      }
    } catch (error) {
      console.error('Error fetching medical info:', error);
      toast({
        title: "Error",
        description: "Failed to load medical information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          medical_allergies: medicalInfo.medical_allergies,
          medical_conditions: medicalInfo.medical_conditions,
          medical_medications: medicalInfo.medical_medications,
          blood_type: medicalInfo.blood_type,
          emergency_notes: medicalInfo.emergency_notes
        })
        .eq('id', user?.id);

      if (error) throw error;

      setIsEditing(false);
      toast({
        title: "Medical Information Updated",
        description: "Your medical information has been securely saved",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update medical information",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const addItem = (type: 'allergies' | 'conditions' | 'medications', value: string) => {
    if (!value.trim()) return;

    const key = `medical_${type}` as keyof MedicalInfo;
    const currentArray = medicalInfo[key] as string[];
    
    if (!currentArray.includes(value.trim())) {
      setMedicalInfo(prev => ({
        ...prev,
        [key]: [...currentArray, value.trim()]
      }));
    }

    // Clear input
    if (type === 'allergies') setNewAllergy("");
    if (type === 'conditions') setNewCondition("");
    if (type === 'medications') setNewMedication("");
  };

  const removeItem = (type: 'allergies' | 'conditions' | 'medications', index: number) => {
    const key = `medical_${type}` as keyof MedicalInfo;
    const currentArray = medicalInfo[key] as string[];
    
    setMedicalInfo(prev => ({
      ...prev,
      [key]: currentArray.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return <div className="flex items-center justify-center py-8">Loading medical information...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Medical Information Header */}
      <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-destructive" />
              <CardTitle>Medical Information</CardTitle>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit className="w-4 h-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This information is securely encrypted and only accessible to you and your emergency contacts.
          </p>
        </CardContent>
      </Card>

      {/* Blood Type & Emergency Notes */}
      <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle>Basic Medical Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Blood Type</Label>
              {isEditing ? (
                <Select
                  value={medicalInfo.blood_type || ""}
                  onValueChange={(value) => setMedicalInfo(prev => ({ ...prev, blood_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOD_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm">{medicalInfo.blood_type || 'Not specified'}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Emergency Notes</Label>
            {isEditing ? (
              <Textarea
                value={medicalInfo.emergency_notes || ""}
                onChange={(e) => setMedicalInfo(prev => ({ ...prev, emergency_notes: e.target.value }))}
                placeholder="Important medical information for emergency responders..."
                rows={3}
              />
            ) : (
              <p className="text-sm leading-relaxed">
                {medicalInfo.emergency_notes || 'No emergency notes added'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Allergies */}
      <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle>Allergies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing && (
            <div className="flex gap-2">
              <Input
                placeholder="Add allergy..."
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addItem('allergies', newAllergy)}
              />
              <Button
                onClick={() => addItem('allergies', newAllergy)}
                className="bg-gradient-to-r from-primary to-primary-glow"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
          
          <div className="flex flex-wrap gap-2">
            {medicalInfo.medical_allergies.length > 0 ? (
              medicalInfo.medical_allergies.map((allergy, index) => (
                <Badge key={index} variant="destructive" className="gap-1">
                  {allergy}
                  {isEditing && (
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-destructive-foreground/80"
                      onClick={() => removeItem('allergies', index)}
                    />
                  )}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No allergies recorded</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Medical Conditions */}
      <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle>Medical Conditions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing && (
            <div className="flex gap-2">
              <Input
                placeholder="Add medical condition..."
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addItem('conditions', newCondition)}
              />
              <Button
                onClick={() => addItem('conditions', newCondition)}
                className="bg-gradient-to-r from-primary to-primary-glow"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
          
          <div className="flex flex-wrap gap-2">
            {medicalInfo.medical_conditions.length > 0 ? (
              medicalInfo.medical_conditions.map((condition, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {condition}
                  {isEditing && (
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-muted-foreground/80"
                      onClick={() => removeItem('conditions', index)}
                    />
                  )}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No medical conditions recorded</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Medications */}
      <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle>Current Medications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing && (
            <div className="flex gap-2">
              <Input
                placeholder="Add medication..."
                value={newMedication}
                onChange={(e) => setNewMedication(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addItem('medications', newMedication)}
              />
              <Button
                onClick={() => addItem('medications', newMedication)}
                className="bg-gradient-to-r from-primary to-primary-glow"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
          
          <div className="flex flex-wrap gap-2">
            {medicalInfo.medical_medications.length > 0 ? (
              medicalInfo.medical_medications.map((medication, index) => (
                <Badge key={index} variant="outline" className="gap-1">
                  {medication}
                  {isEditing && (
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-muted-foreground/80"
                      onClick={() => removeItem('medications', index)}
                    />
                  )}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No medications recorded</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      {isEditing && (
        <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
          <CardContent className="p-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-gradient-to-r from-primary to-primary-glow"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Medical Information'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MedicalProfile;