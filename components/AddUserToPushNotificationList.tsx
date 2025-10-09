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
import { DialogClose } from "@radix-ui/react-dialog";
import { ChevronRightCircle, Search, X } from "lucide-react"
import { useEffect, useState } from "react";
import { LiaSearchSolid } from "react-icons/lia";
import { PiArrowCircleRight } from "react-icons/pi";
import Button from "./Button";

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
      <DialogContent className="flex flex-col gap-2 h-fit p-0">
        <DialogHeader className='bg-[#F2F8FD] px-4 py-5'>
          <DialogTitle className="text-primary">Usuários</DialogTitle>
        </DialogHeader>

        <div className="px-3 gap-2 flex flex-col pb-2">
          <DialogDescription className="text-primary mb-1">Selecione os usuários que deseja enviar o push notification.</DialogDescription>
         
          <div className="flex gap-2 h-full max-h-[20rem] ring-1 ring-zinc-300 rounded-md p-2">
            <div className='flex flex-col h-full gap-1'>
              <div className='ring-1 ring-zinc-300 flex items-center gap-1 bg-white px-4 py-2 w-fit rounded-md'>
                <LiaSearchSolid className="w-6 h-6" />
                <input 
                  value={search} 
                  onChange={e => handleSearchChange(e.target.value)} 
                  type="text" 
                  name="search" 
                  id="search" 
                  onInput={e => setSearch} 
                  placeholder='Pesquise por nome ou CPF' 
                  className='px-2 py-0 w-56 focus:outline-none' 
                />
              </div>
              {predictions.length > 0 && (
                <ul className="w-full h-[12.5rem] overflow-y-scroll custom-scroll flex flex-col pr-1">
                  {predictions && predictions.map((user: User) => (
                    <>
                        <li
                        key={user.$id}
                        className="px-1 py-2 cursor-pointer hover:bg-zinc-100 italic flex"
                        onClick={() => handlePredictionSelect(user)}
                      >
                        {user.name}
                        <PiArrowCircleRight className="w-6 h-6 ml-auto" />
                      </li>
                      <span className="h-[1px] w-[100%] self-center bg-zinc-300" />
                    </>
                  ))}
                </ul>
              )}
            </div>

            <div className="w-80 flex flex-col h-full">
              <div className="flex items-center gap-1 bg-zinc-100 px-4 py-2 w-full rounded-t-md">
                <h2>Usuários selecionados</h2>
              </div>

              <ul className="w-full min-h-[13rem] max-h-[13rem] flex flex-col border overflow-auto px-2 py-1">
                {targets && targets.map((target) => (
                  <>
                    <li
                      key={target.$id}
                      className="py-2 cursor-pointer hover:bg-white italic flex justify-between"
                    >
                      {target.name}
                      <button
                        onClick={() => handleRemoveTarget(target)}
                      >
                        <X className="w-6 h-6 ml-auto" />
                      </button>
                    </li>
                    <span className="h-[1px] w-[100%] self-center bg-zinc-300" />
                  </>
                ))}
                {
                  targets.length > 0 && (
                    <li className="w-full flex justify-end">
                      <button className="underline" onClick={() => setTargets([])}>
                        Remover todos
                      </button>
                    </li>
                  )
                }
              </ul>
            </div>
          </div>

          <div className="flex justify-between mt-2">
            <Button className="py-1 lg:text-base" variant="white">
              <DialogClose>
                Cancelar
              </DialogClose>
            </Button>
            <Button className="py-1 lg:text-base" variant="blue">
              <DialogClose>
                Selecionar usuários
              </DialogClose>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AddUserToPushNotificationList