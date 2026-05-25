"use client";

import { useEffect, useState } from "react";
import { fetcher } from "@/lib/fetcher";
import { ICategory } from "@/types/category.type";
import useSWR from "swr";
import api from "@/lib/axios";
import { GripVertical } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Explicitly require 'order' for the flat UI state
interface FlatCategory extends Omit<ICategory, "order"> {
  depth: number;
  parentId: string | null;
  order: number;
}

// Helper: Flattens the nested data from your API into a 1D array
function flattenCategories(categories: ICategory[]): FlatCategory[] {
  const flat: FlatCategory[] = [];
  categories.forEach((cat) => {
    // Fallback to 0 if order is undefined coming from the DB
    flat.push({ ...cat, depth: 0, parentId: null, order: cat.order || 0 });

    if (cat.children && cat.children.length > 0) {
      cat.children.forEach((child) => {
        flat.push({
          ...child,
          depth: 1,
          parentId: cat._id as string,
          order: child.order || 0,
        });
      });
    }
  });
  return flat;
}

// --- SINGLE SORTABLE ITEM ---
function TreeItem({ item }: { item: FlatCategory }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item._id as string });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Visual indentation based on depth
    marginLeft: `${item.depth * 2}rem`,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-3 border rounded-lg ${
        item.depth === 0 ? "bg-background" : " mt-1"
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
      >
        <GripVertical size={20} />
      </div>

      <Image
        src={item.icon || "/placeholder.png"}
        alt={item.name}
        width={item.depth === 0 ? 40 : 30}
        height={item.depth === 0 ? 40 : 30}
        className="rounded object-contain"
      />
      <span
        className={item.depth === 0 ? "font-semibold" : "font-medium text-sm "}
      >
        {item.name}
      </span>
    </div>
  );
}

// --- MAIN COMPONENT ---
export default function FeaturedCategories() {
  const { data, mutate } = useSWR<{ data: ICategory[] }>(
    "/categories/featured",
    fetcher,
  );

  // We maintain a local flat list state for instant UI updates during dragging
  const [items, setItems] = useState<FlatCategory[]>([]);

  // Sync SWR data to local flat state when data arrives
  useEffect(() => {
    if (data?.data) {
      setItems(flattenCategories(data.data));
    }
  }, [data]);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over, delta } = event;
    if (!over) return;

    const oldIndex = items.findIndex((i) => i._id === active.id);
    const newIndex = items.findIndex((i) => i._id === over.id);

    //  Deep clone the array so we don't mutate React state directly
    const movedArray = arrayMove(items, oldIndex, newIndex);
    const newItems = movedArray.map((item) => ({ ...item }));

    const draggedItem = newItems[newIndex];
    const previousItem = newIndex > 0 ? newItems[newIndex - 1] : null;

    let projectedDepth = draggedItem.depth;

    // Detect horizontal drag
    if (delta.x >= 40) {
      projectedDepth = Math.min(projectedDepth + 1, 1);
    } else if (delta.x <= -40) {
      projectedDepth = Math.max(projectedDepth - 1, 0);
    }

    // Constraints
    if (newIndex === 0) {
      projectedDepth = 0;
    } else if (previousItem && projectedDepth > previousItem.depth + 1) {
      projectedDepth = previousItem.depth + 1;
    }
    projectedDepth = Math.min(projectedDepth, 1); // Max depth 1

    draggedItem.depth = projectedDepth;

    if (projectedDepth === 0) {
      draggedItem.parentId = null;
    } else {
      // Find the nearest Root above it to become its child
      for (let i = newIndex - 1; i >= 0; i--) {
        if (newItems[i].depth === 0) {
          draggedItem.parentId = newItems[i]._id as string;
          break;
        }
      }
    }

    // --- UPDATE ORDERS: Now update relative order for roots and children ---
    let rootOrder = 0;
    const parentChildrenCount: Record<string, number> = {};

    newItems.forEach((item) => {
      if (item.depth === 0) {
        rootOrder += 1;
        item.order = rootOrder;
        parentChildrenCount[item._id as string] = 0; // Initialize children count
      } else {
        const pId = item.parentId as string;
        if (parentChildrenCount[pId] !== undefined) {
          parentChildrenCount[pId] += 1;
        } else {
          parentChildrenCount[pId] = 1; // Fallback
        }
        item.order = parentChildrenCount[pId];
      }
    });

    setItems(newItems);

    //  Prepare payload for the backend
    const payload = newItems.map((item) => ({
      id: item._id,
      order: item.order,
      parentId: item.parentId,
    }));

    try {
      await api.patch("/categories/reorder-featured", { orders: payload });
      toast.success("Category tree updated");
      mutate();
    } catch{
      toast.error("Failed to update tree");
      mutate();
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Featured Categories</h2>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((i) => i._id as string)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {items.map((item) => (
              <TreeItem key={item._id as string} item={item} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
