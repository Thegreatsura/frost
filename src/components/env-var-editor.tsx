"use client";

import { Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EnvVar {
  key: string;
  value: string;
}

interface EnvVarEditorProps {
  value: EnvVar[];
  onChange: (vars: EnvVar[]) => void;
}

export function EnvVarEditor({ value, onChange }: EnvVarEditorProps) {
  const baseId = useId();
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});

  function handleAdd() {
    onChange([...value, { key: "", value: "" }]);
  }

  function handleRemove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function handleChange(index: number, field: "key" | "value", val: string) {
    const updated = [...value];
    updated[index] = { ...updated[index], [field]: val };
    onChange(updated);
  }

  function toggleShow(id: string) {
    setShowValues((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="space-y-2">
      {value.map((envVar, index) => {
        const id = `${baseId}-${index}`;
        return (
          <div key={id} className="flex gap-2">
            <Input
              placeholder="KEY"
              value={envVar.key}
              onChange={(e) => handleChange(index, "key", e.target.value)}
              className="font-mono"
            />
            <div className="relative flex-1">
              <Input
                placeholder="value"
                type={showValues[id] ? "text" : "password"}
                value={envVar.value}
                onChange={(e) => handleChange(index, "value", e.target.value)}
                className="pr-10 font-mono"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-0 h-9 w-9"
                onClick={() => toggleShow(id)}
              >
                {showValues[id] ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemove(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      })}
      <Button type="button" variant="outline" size="sm" onClick={handleAdd}>
        <Plus className="mr-1 h-4 w-4" />
        Add Variable
      </Button>
    </div>
  );
}
