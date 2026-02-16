import bellIcon from "../../assets/bell.png";
import emptyList from "../../assets/emptyList.png";

import styles from "./Wishlist.module.css";

//TODO: Dummy type, replace with actual type when backend is ready
export type WishItemType = {
  id: number;
  name: string;
  price: string;
  image: string;
}[];

export const Wishlist = () => {
  const login = true; //TODO: Replace with actual login state from redux
  const wishlistItems: WishItemType = [
    // {
    //   id: 1,
    //   name: "Sneaker 1",
    //   price: "$100",
    //   image:
    //     "https://img.drz.lazcdn.com/static/lk/p/f96ae7148c090605e2603ac7be92cbad.jpg_960x960q80.jpg_.webp",
    // },
  ];
  return (
    <div className={styles.wishlistContainer}>
      {login ? (
        <div className={styles.wishlist}>
          {wishlistItems.length > 0 ? (
            <ul>
              {wishlistItems.map((item) => (
                <li key={item.id}>
                  <img src={item.image} alt={item.name} />
                  <p>{item.name}</p>
                  <p>{item.price}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div>
              <img
                className={styles.wishlist__icon}
                src={bellIcon}
                alt="Bell icon"
              />
              <p className={styles.wishlist__message}>
                Your wishlist is empty—for now. Start liking products, to save
                them here
              </p>
            </div>
          )}
        </div>
      ) : (
        <div>
          <img
            className={styles.wishlist__icon}
            src={emptyList}
            alt="Empty list icon"
          />
          <p className={styles.wishlist__message}>
            Your wishlist is waiting. Log in to continue.
          </p>
        </div>
      )}
    </div>
  );
};
