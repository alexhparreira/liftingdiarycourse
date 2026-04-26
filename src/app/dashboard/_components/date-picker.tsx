"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";

export function DatePicker({ selectedDate }: { selectedDate: Date }) {
  const router = useRouter();

  function handleSelect(date: Date | undefined) {
    if (!date) return;
    router.push(`/dashboard?date=${format(date, "yyyy-MM-dd")}`);
  }

  return (
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={handleSelect}
    />
  );
}
