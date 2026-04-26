import { auth } from "@clerk/nextjs/server";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getWorkoutsForDate } from "@/data/workouts";
import { DatePicker } from "./_components/date-picker";

type Props = {
  searchParams: Promise<{ date?: string }>;
};

export default async function DashboardPage({ searchParams }: Props) {
  const { userId } = await auth();
  const { date: dateParam } = await searchParams;

  const selectedDate = dateParam
    ? (() => {
        const [year, month, day] = dateParam.split("-").map(Number);
        return new Date(year, month - 1, day);
      })()
    : new Date();

  const workoutsForDate = await getWorkoutsForDate(userId!, selectedDate);

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-8">Dashboard</h1>

      <div className="flex gap-6 items-start">
        <div className="shrink-0 border rounded-xl p-4">
          <DatePicker selectedDate={selectedDate} />
        </div>

        <section className="flex-1 border rounded-xl p-6">
          <h2 className="text-sm font-medium mb-4">
            Workouts for{" "}
            <span className="text-muted-foreground">
              {format(selectedDate, "do MMM yyyy")}
            </span>
          </h2>

          {workoutsForDate.length === 0 ? (
            <div className="flex flex-col items-start gap-4">
              <p className="text-sm text-muted-foreground">
                No workouts logged for this date.
              </p>
              <Button>Log New Workout</Button>
            </div>
            
          ) : (
            <ul className="space-y-4">
              {workoutsForDate.map((workout) => (
                <li key={workout.id}>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{workout.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {workout.exercises.map((ex) => (
                          <li key={ex}>— {ex}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
