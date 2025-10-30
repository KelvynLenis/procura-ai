import type { QueryFilter } from "@/types";
import { getStolenDevices } from "../devices/list-stolen-devices";
import { getEvents } from "../event/get-events";
import { getUser } from "../user/get-user";
import { getDevices } from "../devices/list-devices";
import { listContacts } from "../contact/list-contacts";
import type { Contact } from "@/types";

interface joinProps {
  devicesFilters?: QueryFilter[];
  eventsFilters?: QueryFilter[];
  usersFilters?: QueryFilter[];
}

export async function joinDevicesEventsUsers(props?: joinProps) {
  try {
    const devicesFilters = props?.devicesFilters || [];

    const stolenDevices = await getDevices({
      filters: devicesFilters && devicesFilters,
    });

    if (stolenDevices.length === 0) {
      return [];
    }

    const activeAlertsEvents = await getEvents();

    const enrichedDevices = await Promise.all(
      stolenDevices.map(async (device) => {
        const recentEvent = activeAlertsEvents
          .filter((event) => event.id_device === device.$id)
          .sort(
            (a, b) =>
              new Date(b.$createdAt).getTime() -
              new Date(a.$createdAt).getTime(),
          )[0];

        const userFilter = {
          method: "equal",
          attribute: "user_id",
          values: [device.auth_id],
        };

        const ownerResponse = await getUser({ filters: [userFilter] });
        const ownerInfo = ownerResponse?.[0];

        const emergencyContacts = await listContacts({
          userIdParam: device.auth_id,
        });

        return {
          device: { ...device },
          event: recentEvent,
          user: {
            name: ownerInfo?.name || "Usuário excluído",
            email: ownerInfo?.email || "Sem email",
            cpf: ownerInfo?.cpf || "Sem CPF",
            emergency_contacts: emergencyContacts?.map((contact: Contact) => ({
              name: contact.name_contact,
              email: contact.email_contact,
            })),
          },
        };
      }),
    );
    return enrichedDevices;
  } catch (error) {
    console.error(error);
  }
}

export async function joinUsersDevicesEvents(props?: joinProps) {
  const devicesFilters = props?.devicesFilters || [];
  const eventsFilters = props?.eventsFilters || [];
  const usersFilters = props?.usersFilters || [];

  const ownerResponse = await getUser({ filters: usersFilters });
  const usersID = ownerResponse.map((owner) => owner.$id);

  const deviceFilter = {
    method: "equal",
    attribute: "auth_id",
    values: [usersID],
  };

  const activeDevicesFilters = [
    ...(devicesFilters.length > 0 ? devicesFilters : []),
    deviceFilter,
  ];

  const stolenDevices = await getDevices({
    filters: activeDevicesFilters,
  });

  const activeAlertsEvents = await getEvents();

  const enrichedDevices = await Promise.all(
    stolenDevices.map(async (device) => {
      const recentEvent = activeAlertsEvents
        .filter((event) => event.id_device === device.$id)
        .sort(
          (a, b) =>
            new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime(),
        )[0];

      const userFilter = {
        method: "equal",
        attribute: "user_id",
        values: [device.auth_id],
      };

      const ownerResponse = await getUser({ filters: [userFilter] });
      const ownerInfo = ownerResponse?.[0];
      return {
        device: { ...device },
        event: recentEvent,
        user: {
          name: ownerInfo?.name || "Usuário excluído",
          email: ownerInfo?.email || "Sem email",
          cpf: ownerInfo?.cpf || "Sem CPF",
        },
      };
    }),
  );

  return enrichedDevices;
}
