import NotificationForm from "@/components/Forms/NotificationForm";

export default async function page() {
  return (
    <div className="w-full h-full flex flex-col gap-4 justify-center py-4 mr-5 pr-5">
      <NotificationForm />
    </div>
  );
}
