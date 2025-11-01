import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getUser } from "@/functions/user/get-user";
import { listAllUsers } from "@/functions/user/list-all-users";
import { User } from "@/types";
import { DialogClose } from "@radix-ui/react-dialog";
import {
  ChevronDown,
  ChevronRight,
  ChevronRightCircle,
  Search,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { LiaSearchSolid } from "react-icons/lia";
import { PiArrowCircleRight } from "react-icons/pi";
import Button from "./Button";

interface AddUserToPushNotificationListProps {
  targets: User[];
  setTargets: React.Dispatch<React.SetStateAction<User[]>>;
}

function AddUserToPushNotificationList({
  targets,
  setTargets,
}: AddUserToPushNotificationListProps) {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [countdownId, setcountdownId] = useState<NodeJS.Timeout>();
  // const [targets, setTargets] = useState<User[]>([])
  const [users, setUsers] = useState<User[]>([]);

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
      return;
    }

    const filteredUsers = users.filter((user) =>
      user.name.toLowerCase().includes(text.toLowerCase()),
    );

    setPredictions(filteredUsers);
  };

  function handlePredictionSelect(user: User | undefined) {
    if (!user) return;

    if (targets.includes(user)) return;

    setTargets([...targets, user]);
  }

  function handleRemoveTarget(user: User) {
    setTargets(targets.filter((target) => target.$id !== user.$id));
  }

  useEffect(() => {
    const fetchUsers = async () => {
      const usersResponse = await listAllUsers();

      const filterAdmin = usersResponse.filter(
        (user) => user.type !== "Administrador",
      );

      setUsers(usersResponse);
      setPredictions(filterAdmin);
    };

    fetchUsers();
  }, []);

  return (
    <Dialog>
      <DialogTrigger className="ring-100 flex h-fit max-h-[81px] w-full flex-col gap-2 rounded-lg bg-zinc-100 px-3 py-1.5 ring-1 ring-zinc-300">
        <div className="flex flex-col items-start gap-1 ring-0">
          <div className="flex w-full justify-between">
            <h3 className="text-sm font-medium">Usuários cadastrados</h3>
            <ChevronDown className="h-6 w-6" />
          </div>
          <span className="text-start text-sm font-normal">
            Defina o público selecionando todos os usuários ou pesquise por nome
            ou CPF
          </span>
        </div>
      </DialogTrigger>
      <DialogContent className="flex h-fit flex-col gap-2 p-0">
        <DialogHeader className="bg-[#F2F8FD] px-4 py-5">
          <DialogTitle className="text-primary">Usuários</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-2 px-3 pb-2">
          <DialogDescription className="mb-1 text-primary">
            Selecione os usuários que deseja enviar o push notification.
          </DialogDescription>

          <div className="flex h-full max-h-[20rem] gap-2 rounded-md p-2 ring-1 ring-zinc-300">
            <div className="flex h-full flex-col gap-1">
              <div className="flex w-fit items-center gap-1 rounded-md bg-white px-4 py-2 ring-1 ring-zinc-300">
                <LiaSearchSolid className="h-6 w-6" />
                <input
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  type="text"
                  name="search"
                  id="search"
                  onInput={(e) => setSearch}
                  placeholder="Pesquise por nome ou CPF"
                  className="w-56 px-2 py-0 focus:outline-none"
                />
              </div>
              {predictions.length > 0 && (
                <ul className="custom-scroll flex h-[12.5rem] w-full flex-col overflow-y-scroll pr-1">
                  {predictions &&
                    predictions.map((user: User) => (
                      <>
                        <li
                          key={user.$id}
                          className="flex cursor-pointer px-1 py-2 italic hover:bg-zinc-100"
                          onClick={() => handlePredictionSelect(user)}
                        >
                          {user.name}
                          <PiArrowCircleRight className="ml-auto h-6 w-6" />
                        </li>
                        <span className="h-[1px] w-[100%] self-center bg-zinc-300" />
                      </>
                    ))}
                </ul>
              )}
            </div>

            <div className="flex h-full w-80 flex-col">
              <div className="flex w-full items-center gap-1 rounded-t-md bg-zinc-100 px-4 py-2">
                <h2>Usuários selecionados</h2>
              </div>

              <ul className="flex max-h-[13rem] min-h-[13rem] w-full flex-col overflow-auto border px-2 py-1">
                {targets &&
                  targets.map((target) => (
                    <>
                      <li
                        key={target.$id}
                        className="flex cursor-pointer justify-between py-2 italic hover:bg-white"
                      >
                        {target.name}
                        <button onClick={() => handleRemoveTarget(target)}>
                          <X className="ml-auto h-6 w-6" />
                        </button>
                      </li>
                      <span className="h-[1px] w-[100%] self-center bg-zinc-300" />
                    </>
                  ))}
                {targets.length > 0 && (
                  <li className="flex w-full justify-end">
                    <button
                      className="underline"
                      onClick={() => setTargets([])}
                    >
                      Remover todos
                    </button>
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="mt-2 flex justify-between">
            <Button className="py-1 lg:text-base" variant="white">
              <DialogClose>Cancelar</DialogClose>
            </Button>
            <Button className="py-1 lg:text-base" variant="blue">
              <DialogClose>Selecionar usuários</DialogClose>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AddUserToPushNotificationList;
