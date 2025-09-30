import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getUser } from "@/functions/user/get-user";
import { listAllUsers } from "@/functions/user/list-all-users";
import { User } from "@/types";
import { Search } from "lucide-react"
import { useEffect, useState } from "react";

interface AddUserToPushNotificationListProps {
  targets: User[];
  setTargets: React.Dispatch<React.SetStateAction<User[]>>;
}

function AddUserToPushNotificationList({ targets, setTargets }: AddUserToPushNotificationListProps) {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [countdownId, setcountdownId] = useState<NodeJS.Timeout>();
  // const [targets, setTargets] = useState<User[]>([])
  const [users, setUsers] = useState<User[]>([])
  
  const handleSearchChange = (text: string) => {
    // clearTimeout(countdownId);
    // setSearch(text);

    // if (text.length < 3) {
    //   setPredictions([]);
    //   return;
    // }

    // const timerId = setTimeout(async () => {
    //   try {
    //     const users = await getUser({ filters: 
    //       [{
    //         method: 'contains',
    //         attribute: 'name',
    //         values: [text]
    //       }]
    //     });

    //     if (users.length > 0) {
    //       setPredictions(users);
    //     } else {
    //       setPredictions([]);
    //     }
    //   } catch (err) {
    //     console.error("Erro no autocomplete:", err);
    //   }
    // }, 500);

    // setcountdownId(timerId);

    setSearch(text);

    if (text.length === 0) {
      setPredictions(users);
      return
    }

    const filteredUsers = users.filter((user) => user.name.toLowerCase().includes(text.toLowerCase()));

    setPredictions(filteredUsers);
  };

  function handlePredictionSelect(user: User | undefined) {
    if (!user) return

    if(targets.includes(user)) return

    setTargets([...targets, user])
  };

  function handleRemoveTarget(user: User) {
    setTargets(targets.filter((target) => target.$id !== user.$id))
  }

  useEffect(() => {
    const fetchUsers = async () => {
      const usersResponse = await listAllUsers()

      const filterAdmin = usersResponse.filter(user => user.type !== 'Administrador')
    
      setUsers(usersResponse)
      setPredictions(filterAdmin)
    };

    fetchUsers();
  }, []);

  return (
    <Dialog>
      <DialogTrigger className="bg-white px-4 py-2 ring-1 ring-zinc-300 rounded-md hover:ring-secondary shadow-lg hover:text-white hover:bg-secondary transition-all duration-200">
        Adicionar usuários
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-2 h-[26rem]">
        <DialogHeader>
          <DialogTitle>Selecione os usuários</DialogTitle>
          <DialogDescription>
            Selecione os usuários que deseja adicionar na lista de notificação
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 h-full max-h-[20rem]">
          <div className='flex flex-col h-full'>
            <div className='ring-1 ring-zinc-300 flex items-center gap-2 bg-white px-4 py-2 w-fit'>
              <Search className='w-6 h-6' />
              <input value={search} onChange={e => handleSearchChange(e.target.value)} type="text" name="search" id="search" onInput={e => setSearch} placeholder='Pesquise por nome ou CPF' className='px-4 py-1 w-56 focus:outline-none' />
            </div>
            {predictions.length > 0 && (
              <ul className="w-full h-full overflow-auto flex flex-col ring-1 ring-zinc-300">
                {predictions && predictions.map((user: User) => (
                  <li
                    key={user.$id}
                    className="px-4 py-2 cursor-pointer hover:bg-zinc-100 italic"
                    onClick={() => handlePredictionSelect(user)}
                  >
                    {user.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <span className="h-[20rem] w-1 bg-zinc-500 rounded-md" />

          <div className="w-80 flex flex-col h-full">
            <h2>Selecionados</h2>

            <ul className="w-full h-full flex flex-col bg-zinc-100 ring-1 ring-zinc-300 overflow-auto">
              {targets && targets.map((target) => (
                <li
                  key={target.$id}
                  className="px-4 py-2 cursor-pointer hover:bg-white italic"
                  onClick={() => handleRemoveTarget(target)}
                >
                  {target.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AddUserToPushNotificationList