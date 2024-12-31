import { getUserAction } from "@/actions/userAction";
import { useQuery } from "react-query";

export const GetUserQuery = (id: string) => {
  return useQuery({
    queryKey: ["get-user-" + id],
    queryFn: () => getUserAction(id),
    enabled: !!id
  });
};
