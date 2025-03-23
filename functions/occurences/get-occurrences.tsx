import { getStolenDevices } from '../devices/list-stolen-devices'
import { getEvents } from '../events/list-events'
import { getUser } from '../user/get-user'

export async function joinDevicesEventsUsers() {
  const stolenDevices = await getStolenDevices()
  const activeAlertsEvents = await getEvents()

  const enrichedDevices = await Promise.all(
    stolenDevices.map(async device => {
      const recentEvent = activeAlertsEvents
        .filter(event => event.id_device === device.$id)
        .sort(
          (a, b) =>
            new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
        )[0]

      const ownerResponse = await getUser(device.auth_id!)
      const ownerInfo = ownerResponse?.[0]
      return {
        device: { ...device },
        event: recentEvent,
        user: {
          name: ownerInfo?.name || 'Usuário excluído',
          email: ownerInfo?.email || 'N/A',
        },
      }
    })
  )

  return enrichedDevices
}
