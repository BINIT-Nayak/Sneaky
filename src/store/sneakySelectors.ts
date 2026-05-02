import { useSelector } from "react-redux";

export const useSneakyStateSlice = {
  getIsAuthModalOpen: (): boolean => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useSelector(
      ({ sneakyState }: { sneakyState: { isAuthModalOpen: boolean } }) =>
        sneakyState.isAuthModalOpen,
    );
  },
};
