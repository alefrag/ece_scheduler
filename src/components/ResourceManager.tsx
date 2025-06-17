import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, Edit, Trash2, Search } from "lucide-react";

interface Equipment {
  id: string;
  name: string;
}

interface Classroom {
  id: string;
  name: string;
  capacity: number;
  equipment: Equipment[];
}

interface Laboratory {
  id: string;
  name: string;
  capacity: number;
  equipment: Equipment[];
}

const ResourceManager = () => {
  // Default mock data
  const defaultClassrooms: Classroom[] = [
    {
      id: "1",
      name: "Room A101",
      capacity: 120,
      equipment: [
        { id: "1", name: "Projector" },
        { id: "2", name: "Computer" },
      ],
    },
    {
      id: "2",
      name: "Room B202",
      capacity: 80,
      equipment: [
        { id: "1", name: "Projector" },
        { id: "3", name: "Whiteboard" },
      ],
    },
    {
      id: "3",
      name: "Room C303",
      capacity: 60,
      equipment: [{ id: "3", name: "Whiteboard" }],
    },
  ];

  const defaultLaboratories: Laboratory[] = [
    {
      id: "1",
      name: "Lab CS1",
      capacity: 30,
      equipment: [
        { id: "4", name: "Computers" },
        { id: "5", name: "Network Equipment" },
      ],
    },
    {
      id: "2",
      name: "Lab CS2",
      capacity: 25,
      equipment: [
        { id: "4", name: "Computers" },
        { id: "6", name: "Electronics Kit" },
      ],
    },
    {
      id: "3",
      name: "Lab Physics",
      capacity: 20,
      equipment: [{ id: "7", name: "Physics Equipment" }],
    },
  ];

  // State
  const [classrooms, setClassrooms] = useState<Classroom[]>(defaultClassrooms);
  const [laboratories, setLaboratories] =
    useState<Laboratory[]>(defaultLaboratories);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isAddClassroomDialogOpen, setIsAddClassroomDialogOpen] =
    useState<boolean>(false);
  const [isAddLabDialogOpen, setIsAddLabDialogOpen] = useState<boolean>(false);
  const [isEditClassroomDialogOpen, setIsEditClassroomDialogOpen] =
    useState<boolean>(false);
  const [isEditLabDialogOpen, setIsEditLabDialogOpen] =
    useState<boolean>(false);

  // Form states
  const [newClassroom, setNewClassroom] = useState<Omit<Classroom, "id">>({
    name: "",
    capacity: 0,
    equipment: [],
  });
  const [newLaboratory, setNewLaboratory] = useState<Omit<Laboratory, "id">>({
    name: "",
    capacity: 0,
    equipment: [],
  });
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(
    null,
  );
  const [editingLaboratory, setEditingLaboratory] = useState<Laboratory | null>(
    null,
  );

  // Available equipment options
  const classroomEquipmentOptions: Equipment[] = [
    { id: "1", name: "Projector" },
    { id: "2", name: "Computer" },
    { id: "3", name: "Whiteboard" },
    { id: "8", name: "Smart Board" },
    { id: "9", name: "Audio System" },
  ];

  const laboratoryEquipmentOptions: Equipment[] = [
    { id: "4", name: "Computers" },
    { id: "5", name: "Network Equipment" },
    { id: "6", name: "Electronics Kit" },
    { id: "7", name: "Physics Equipment" },
    { id: "10", name: "Chemistry Kit" },
    { id: "11", name: "Biology Equipment" },
  ];

  // Filter resources based on search query
  const filteredClassrooms = classrooms.filter((classroom) =>
    classroom.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredLaboratories = laboratories.filter((lab) =>
    lab.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Handlers for classroom operations
  const handleAddClassroom = () => {
    const newId = (classrooms.length + 1).toString();
    setClassrooms([...classrooms, { id: newId, ...newClassroom }]);
    setNewClassroom({ name: "", capacity: 0, equipment: [] });
    setIsAddClassroomDialogOpen(false);
  };

  const handleEditClassroom = () => {
    if (editingClassroom) {
      setClassrooms(
        classrooms.map((classroom) =>
          classroom.id === editingClassroom.id ? editingClassroom : classroom,
        ),
      );
      setEditingClassroom(null);
      setIsEditClassroomDialogOpen(false);
    }
  };

  const handleDeleteClassroom = (id: string) => {
    setClassrooms(classrooms.filter((classroom) => classroom.id !== id));
  };

  // Handlers for laboratory operations
  const handleAddLaboratory = () => {
    const newId = (laboratories.length + 1).toString();
    setLaboratories([...laboratories, { id: newId, ...newLaboratory }]);
    setNewLaboratory({ name: "", capacity: 0, equipment: [] });
    setIsAddLabDialogOpen(false);
  };

  const handleEditLaboratory = () => {
    if (editingLaboratory) {
      setLaboratories(
        laboratories.map((lab) =>
          lab.id === editingLaboratory.id ? editingLaboratory : lab,
        ),
      );
      setEditingLaboratory(null);
      setIsEditLabDialogOpen(false);
    }
  };

  const handleDeleteLaboratory = (id: string) => {
    setLaboratories(laboratories.filter((lab) => lab.id !== id));
  };

  // Equipment selection handlers
  const toggleClassroomEquipment = (equipment: Equipment) => {
    if (editingClassroom) {
      const exists = editingClassroom.equipment.some(
        (e) => e.id === equipment.id,
      );
      if (exists) {
        setEditingClassroom({
          ...editingClassroom,
          equipment: editingClassroom.equipment.filter(
            (e) => e.id !== equipment.id,
          ),
        });
      } else {
        setEditingClassroom({
          ...editingClassroom,
          equipment: [...editingClassroom.equipment, equipment],
        });
      }
    } else {
      const exists = newClassroom.equipment.some((e) => e.id === equipment.id);
      if (exists) {
        setNewClassroom({
          ...newClassroom,
          equipment: newClassroom.equipment.filter(
            (e) => e.id !== equipment.id,
          ),
        });
      } else {
        setNewClassroom({
          ...newClassroom,
          equipment: [...newClassroom.equipment, equipment],
        });
      }
    }
  };

  const toggleLaboratoryEquipment = (equipment: Equipment) => {
    if (editingLaboratory) {
      const exists = editingLaboratory.equipment.some(
        (e) => e.id === equipment.id,
      );
      if (exists) {
        setEditingLaboratory({
          ...editingLaboratory,
          equipment: editingLaboratory.equipment.filter(
            (e) => e.id !== equipment.id,
          ),
        });
      } else {
        setEditingLaboratory({
          ...editingLaboratory,
          equipment: [...editingLaboratory.equipment, equipment],
        });
      }
    } else {
      const exists = newLaboratory.equipment.some((e) => e.id === equipment.id);
      if (exists) {
        setNewLaboratory({
          ...newLaboratory,
          equipment: newLaboratory.equipment.filter(
            (e) => e.id !== equipment.id,
          ),
        });
      } else {
        setNewLaboratory({
          ...newLaboratory,
          equipment: [...newLaboratory.equipment, equipment],
        });
      }
    }
  };

  return (
    <div className="container mx-auto p-6 bg-background">
      <h1 className="text-3xl font-bold mb-6">Resource Manager</h1>

      {/* Search Bar */}
      <div className="flex mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs for Classrooms and Laboratories */}
      <Tabs defaultValue="classrooms">
        <TabsList className="mb-4">
          <TabsTrigger value="classrooms">Classrooms</TabsTrigger>
          <TabsTrigger value="laboratories">Laboratories</TabsTrigger>
        </TabsList>

        {/* Classrooms Tab */}
        <TabsContent value="classrooms">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Classrooms</CardTitle>
                  <CardDescription>
                    Manage classroom spaces and their equipment
                  </CardDescription>
                </div>
                <Dialog
                  open={isAddClassroomDialogOpen}
                  onOpenChange={setIsAddClassroomDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Classroom
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Classroom</DialogTitle>
                      <DialogDescription>
                        Enter the details for the new classroom.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Name
                        </Label>
                        <Input
                          id="name"
                          value={newClassroom.name}
                          onChange={(e) =>
                            setNewClassroom({
                              ...newClassroom,
                              name: e.target.value,
                            })
                          }
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="capacity" className="text-right">
                          Capacity
                        </Label>
                        <Input
                          id="capacity"
                          type="number"
                          value={newClassroom.capacity}
                          onChange={(e) =>
                            setNewClassroom({
                              ...newClassroom,
                              capacity: parseInt(e.target.value) || 0,
                            })
                          }
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right pt-2">Equipment</Label>
                        <div className="col-span-3 space-y-2">
                          {classroomEquipmentOptions.map((equipment) => (
                            <div
                              key={equipment.id}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`equipment-${equipment.id}`}
                                checked={newClassroom.equipment.some(
                                  (e) => e.id === equipment.id,
                                )}
                                onCheckedChange={() =>
                                  toggleClassroomEquipment(equipment)
                                }
                              />
                              <Label htmlFor={`equipment-${equipment.id}`}>
                                {equipment.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsAddClassroomDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleAddClassroom}>
                        Add Classroom
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Equipment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClassrooms.length > 0 ? (
                    filteredClassrooms.map((classroom) => (
                      <TableRow key={classroom.id}>
                        <TableCell className="font-medium">
                          {classroom.name}
                        </TableCell>
                        <TableCell>{classroom.capacity}</TableCell>
                        <TableCell>
                          {classroom.equipment.map((e) => e.name).join(", ")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingClassroom(classroom);
                                setIsEditClassroomDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                handleDeleteClassroom(classroom.id)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        No classrooms found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Edit Classroom Dialog */}
          <Dialog
            open={isEditClassroomDialogOpen}
            onOpenChange={setIsEditClassroomDialogOpen}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Classroom</DialogTitle>
                <DialogDescription>
                  Update the details for this classroom.
                </DialogDescription>
              </DialogHeader>
              {editingClassroom && (
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="edit-name"
                      value={editingClassroom.name}
                      onChange={(e) =>
                        setEditingClassroom({
                          ...editingClassroom,
                          name: e.target.value,
                        })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-capacity" className="text-right">
                      Capacity
                    </Label>
                    <Input
                      id="edit-capacity"
                      type="number"
                      value={editingClassroom.capacity}
                      onChange={(e) =>
                        setEditingClassroom({
                          ...editingClassroom,
                          capacity: parseInt(e.target.value) || 0,
                        })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right pt-2">Equipment</Label>
                    <div className="col-span-3 space-y-2">
                      {classroomEquipmentOptions.map((equipment) => (
                        <div
                          key={equipment.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`edit-equipment-${equipment.id}`}
                            checked={editingClassroom.equipment.some(
                              (e) => e.id === equipment.id,
                            )}
                            onCheckedChange={() =>
                              toggleClassroomEquipment(equipment)
                            }
                          />
                          <Label htmlFor={`edit-equipment-${equipment.id}`}>
                            {equipment.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditClassroomDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleEditClassroom}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Laboratories Tab */}
        <TabsContent value="laboratories">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Laboratories</CardTitle>
                  <CardDescription>
                    Manage laboratory spaces and their equipment
                  </CardDescription>
                </div>
                <Dialog
                  open={isAddLabDialogOpen}
                  onOpenChange={setIsAddLabDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Laboratory
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Laboratory</DialogTitle>
                      <DialogDescription>
                        Enter the details for the new laboratory.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="lab-name" className="text-right">
                          Name
                        </Label>
                        <Input
                          id="lab-name"
                          value={newLaboratory.name}
                          onChange={(e) =>
                            setNewLaboratory({
                              ...newLaboratory,
                              name: e.target.value,
                            })
                          }
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="lab-capacity" className="text-right">
                          Capacity
                        </Label>
                        <Input
                          id="lab-capacity"
                          type="number"
                          value={newLaboratory.capacity}
                          onChange={(e) =>
                            setNewLaboratory({
                              ...newLaboratory,
                              capacity: parseInt(e.target.value) || 0,
                            })
                          }
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right pt-2">Equipment</Label>
                        <div className="col-span-3 space-y-2">
                          {laboratoryEquipmentOptions.map((equipment) => (
                            <div
                              key={equipment.id}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`lab-equipment-${equipment.id}`}
                                checked={newLaboratory.equipment.some(
                                  (e) => e.id === equipment.id,
                                )}
                                onCheckedChange={() =>
                                  toggleLaboratoryEquipment(equipment)
                                }
                              />
                              <Label htmlFor={`lab-equipment-${equipment.id}`}>
                                {equipment.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsAddLabDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleAddLaboratory}>
                        Add Laboratory
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Equipment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLaboratories.length > 0 ? (
                    filteredLaboratories.map((lab) => (
                      <TableRow key={lab.id}>
                        <TableCell className="font-medium">
                          {lab.name}
                        </TableCell>
                        <TableCell>{lab.capacity}</TableCell>
                        <TableCell>
                          {lab.equipment.map((e) => e.name).join(", ")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingLaboratory(lab);
                                setIsEditLabDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteLaboratory(lab.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        No laboratories found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Edit Laboratory Dialog */}
          <Dialog
            open={isEditLabDialogOpen}
            onOpenChange={setIsEditLabDialogOpen}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Laboratory</DialogTitle>
                <DialogDescription>
                  Update the details for this laboratory.
                </DialogDescription>
              </DialogHeader>
              {editingLaboratory && (
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-lab-name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="edit-lab-name"
                      value={editingLaboratory.name}
                      onChange={(e) =>
                        setEditingLaboratory({
                          ...editingLaboratory,
                          name: e.target.value,
                        })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-lab-capacity" className="text-right">
                      Capacity
                    </Label>
                    <Input
                      id="edit-lab-capacity"
                      type="number"
                      value={editingLaboratory.capacity}
                      onChange={(e) =>
                        setEditingLaboratory({
                          ...editingLaboratory,
                          capacity: parseInt(e.target.value) || 0,
                        })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right pt-2">Equipment</Label>
                    <div className="col-span-3 space-y-2">
                      {laboratoryEquipmentOptions.map((equipment) => (
                        <div
                          key={equipment.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`edit-lab-equipment-${equipment.id}`}
                            checked={editingLaboratory.equipment.some(
                              (e) => e.id === equipment.id,
                            )}
                            onCheckedChange={() =>
                              toggleLaboratoryEquipment(equipment)
                            }
                          />
                          <Label htmlFor={`edit-lab-equipment-${equipment.id}`}>
                            {equipment.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditLabDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleEditLaboratory}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResourceManager;
