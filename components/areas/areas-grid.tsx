"use client";

import {
  Briefcase,
  DollarSign,
  Heart,
  LandPlot,
  Languages,
  Plane,
  Plus,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";
import CreateAreaDialog from "@/components/areas/create-area-dialog";

export function AreasGrid() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <div className="flex h-full flex-col">
        <h2 className="mb-4 flex items-center text-sm text-gray-400">
          <LandPlot className="mr-2 h-4 w-4" />
          Areas
        </h2>
        <div className="grid flex-grow grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {[
            { name: "Personal", icon: User },
            { name: "Health & Fitness", icon: Heart },
            { name: "Side Hustle", icon: Briefcase },
            { name: "Travel", icon: Plane },
            { name: "Language Learning", icon: Languages },
            { name: "Investing", icon: DollarSign },
          ].map((area, index) => (
            <div
              key={index}
              className="group relative flex transform flex-col items-center justify-center rounded-xl bg-card p-4 shadow-md transition-transform hover:scale-105"
            >
              <area.icon className="mb-2 h-8 w-8 text-black transition-transform group-hover:scale-110 dark:text-white" />
              <span className="text-black dark:text-white">{area.name}</span>
              <div className="absolute inset-0 rounded-xl bg-card opacity-0 transition-opacity group-hover:opacity-30"></div>
            </div>
          ))}
          <Button
            variant="ghost"
            className="flex h-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-600 transition-transform hover:scale-105"
            onClick={() => setOpen(true)}
          >
            <Plus className="mb-2 h-6 w-6 text-gray-400 transition-transform hover:scale-110" />
            <span className="text-gray-400">New area</span>
          </Button>
        </div>
      </div>
      <CreateAreaDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
