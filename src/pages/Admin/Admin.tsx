import type { FormEvent } from "react";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import {
  FiCheck,
  FiEdit2,
  FiLogOut,
  FiPackage,
  FiRefreshCw,
  FiShield,
  FiSlash,
  FiTrash2,
  FiUsers,
  FiX,
} from "react-icons/fi";

import { AuthContext } from "../../context/AuthContext";
import type {
  AdminBrand,
  AdminProduct,
  AdminStats,
  AdminUser,
  ProductFormPayload,
} from "../../services/adminAPI";
import { adminApi } from "../../services/adminAPI";
import { getUserFriendlyErrorMessage } from "../../utils/errorMessages";
import { isAdminRole, normalizeRole } from "../../utils/roles";

import styles from "./Admin.module.css";

const emptyProductForm: ProductFormPayload = {
  name: "",
  description: "",
  price: 0,
  imageUrl: "",
  category: "",
  brandId: "",
  isActive: true,
};

const productStatusOptions = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Inactive", value: "INACTIVE" },
];

const productIdOf = (product: AdminProduct) => product.productId;

const brandIdOf = (product: AdminProduct) =>
  product.brand?.brandId ?? product.brand?.id ?? "";

const brandNameOf = (product: AdminProduct) =>
  product.brand?.name?.trim() || "No brand";

type AdminPanel = "users" | "products" | "brands";

type AdminRouteState = {
  editProductId?: string;
};

export const Admin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, onLogout, onOpenAuth, user } = useContext(AuthContext);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [brands, setBrands] = useState<AdminBrand[]>([]);
  const [productStatusFilter, setProductStatusFilter] = useState("");
  const [activePanel, setActivePanel] = useState<AdminPanel>("products");
  const [productForm, setProductForm] =
    useState<ProductFormPayload>(emptyProductForm);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [brandName, setBrandName] = useState("");
  const [editingBrand, setEditingBrand] = useState<AdminBrand | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [isBrandsLoading, setIsBrandsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const productRequestId = useRef(0);
  const isAdmin = isAdminRole(user?.role);
  const routeState = location.state as AdminRouteState | null;
  const productIdToEdit = routeState?.editProductId;
  const isLoading =
    isStatsLoading || isUsersLoading || isProductsLoading || isBrandsLoading;

  const loadStats = useCallback(async () => {
    setIsStatsLoading(true);
    try {
      const nextStats = await adminApi.getStats();
      setStats(nextStats);
    } catch (err) {
      setError(
        getUserFriendlyErrorMessage(err, "We couldn't load the admin stats."),
      );
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    setIsUsersLoading(true);
    try {
      const nextUsers = await adminApi.getUsers();
      setUsers(nextUsers.content);
    } catch (err) {
      setError(
        getUserFriendlyErrorMessage(err, "We couldn't load the admin users."),
      );
    } finally {
      setIsUsersLoading(false);
    }
  }, []);

  const loadBrands = useCallback(async () => {
    setIsBrandsLoading(true);
    try {
      const nextBrands = await adminApi.getBrands();
      setBrands(nextBrands);
    } catch (err) {
      setError(getUserFriendlyErrorMessage(err, "We couldn't load the brands."));
    } finally {
      setIsBrandsLoading(false);
    }
  }, []);

  const loadProducts = useCallback(
    async (status = productStatusFilter) => {
      const requestId = productRequestId.current + 1;
      productRequestId.current = requestId;
      setIsProductsLoading(true);
      try {
        const nextProducts = await adminApi.getProducts(status);
        if (productRequestId.current === requestId) {
          setProducts(nextProducts.content);
        }
      } catch (err) {
        if (productRequestId.current === requestId) {
          setError(
            getUserFriendlyErrorMessage(err, "We couldn't load the products."),
          );
        }
      } finally {
        if (productRequestId.current === requestId) {
          setIsProductsLoading(false);
        }
      }
    },
    [productStatusFilter],
  );

  const refreshDashboard = useCallback(async () => {
    setError(null);
    await Promise.all([loadStats(), loadUsers(), loadBrands(), loadProducts()]);
  }, [loadBrands, loadProducts, loadStats, loadUsers]);

  useEffect(() => {
    if (!isAdmin) return;

    void Promise.all([loadStats(), loadUsers(), loadBrands()]);
  }, [isAdmin, loadBrands, loadStats, loadUsers]);

  useEffect(() => {
    if (!isAdmin) return;

    void loadProducts(productStatusFilter);
  }, [isAdmin, loadProducts, productStatusFilter]);

  const handleEditProduct = useCallback((product: AdminProduct) => {
    setEditingProductId(productIdOf(product));
    setProductForm({
      name: product.name,
      description: product.description ?? "",
      price: product.price,
      imageUrl: product.imageUrl ?? "",
      category: product.category ?? "",
      brandId: brandIdOf(product),
      isActive: product.isActive ?? true,
    });
    setActivePanel("products");
  }, []);

  useEffect(() => {
    if (!isAdmin || !productIdToEdit) return;

    setActivePanel("products");
    setProductStatusFilter("");

    const product = products.find(
      (item) => productIdOf(item) === productIdToEdit,
    );
    if (product) {
      handleEditProduct(product);
      navigate(location.pathname, { replace: true, state: null });
      return;
    }

    if (!isProductsLoading && products.length > 0) {
      setError("We couldn't find that product in the admin list.");
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [
    handleEditProduct,
    isAdmin,
    isProductsLoading,
    location.pathname,
    navigate,
    productIdToEdit,
    products,
  ]);

  const statCards = useMemo(
    () => [
      { label: "Users", value: stats?.totalUsers ?? 0, icon: <FiUsers /> },
      { label: "Admins", value: stats?.admins ?? 0, icon: <FiShield /> },
      {
        label: "Products",
        value: stats?.totalProducts ?? 0,
        icon: <FiPackage />,
      },
      {
        label: "Pending",
        value: stats?.pendingProducts ?? 0,
        icon: <FiRefreshCw />,
      },
      { label: "Brands", value: stats?.totalBrands ?? 0, icon: <FiCheck /> },
      {
        label: "Swipes Today",
        value: stats?.todaySwipes ?? 0,
        icon: <FiSlash />,
      },
    ],
    [stats],
  );

  if (!isLoggedIn) {
    return (
      <div className={styles.admin}>
        <section className={styles.admin__emptyState}>
          <FiShield />
          <h1>Admin access</h1>
          <p>Sign in with an admin account to manage Sneaky.</p>
          <button type="button" onClick={onOpenAuth}>
            Sign In
          </button>
        </section>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/home" replace />;
  }

  const refresh = () => void refreshDashboard();
  const logout = async () => {
    await onLogout();
    navigate("/", { replace: true });
  };

  const setNotice = (message: string) => {
    setSuccess(message);
    setError(null);
  };

  const runAction = async (
    action: () => Promise<unknown>,
    message: string,
    refreshers: Array<() => Promise<void>> = [loadStats, loadProducts],
  ) => {
    setIsMutating(true);
    try {
      await action();
      setNotice(message);
      await Promise.all(refreshers.map((refreshData) => refreshData()));
    } catch (err) {
      setError(getUserFriendlyErrorMessage(err, "Admin action failed."));
    } finally {
      setIsMutating(false);
    }
  };

  const handleSubmitProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = {
      ...productForm,
      name: productForm.name.trim(),
      description: productForm.description?.trim(),
      imageUrl: productForm.imageUrl?.trim(),
      category: productForm.category?.trim(),
      brandId: productForm.brandId || undefined,
      price: Number(productForm.price),
    };

    if (!payload.name || !Number.isFinite(payload.price) || payload.price <= 0) {
      setError("Product name and a valid price are required.");
      return;
    }

    await runAction(
      () =>
        editingProductId
          ? adminApi.updateProduct(editingProductId, payload)
          : adminApi.createProduct(payload),
      editingProductId ? "Product updated" : "Product created",
    );
    setProductForm(emptyProductForm);
    setEditingProductId(null);
  };

  const handleSubmitBrand = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextName = brandName.trim();
    if (!nextName) {
      setError("Brand name is required.");
      return;
    }

    await runAction(
      () =>
        editingBrand
          ? adminApi.updateBrand(editingBrand.id, nextName)
          : adminApi.createBrand(nextName),
      editingBrand ? "Brand updated" : "Brand created",
      [loadStats, loadBrands, loadProducts],
    );
    setBrandName("");
    setEditingBrand(null);
  };

  return (
    <div className={styles.admin}>
      <header className={styles.admin__header}>
        <div>
          <p>Admin</p>
          <h1>Control Center</h1>
        </div>
        <div className={styles.admin__headerActions}>
          <button
            className={styles.admin__iconButton}
            type="button"
            onClick={refresh}
            disabled={isLoading}
            aria-label="Refresh admin data"
            title="Refresh admin data"
          >
            <FiRefreshCw />
          </button>
          <button
            className={styles.admin__logoutButton}
            type="button"
            onClick={() => {
              void logout();
            }}
          >
            <FiLogOut />
            Logout
          </button>
        </div>
      </header>

      {error ? <p className={styles.admin__error}>{error}</p> : null}
      {success ? <p className={styles.admin__success}>{success}</p> : null}

      <section className={styles.admin__stats} aria-label="Admin stats">
        {statCards.map((card) => (
          <article className={styles.admin__stat} key={card.label}>
            <span>{card.icon}</span>
            <strong>{card.value}</strong>
            <p>{card.label}</p>
          </article>
        ))}
      </section>

      <div className={styles.admin__tabs}>
        <button
          className={activePanel === "products" ? styles.admin__tab_active : ""}
          type="button"
          onClick={() => setActivePanel("products")}
        >
          Products
        </button>
        <button
          className={activePanel === "users" ? styles.admin__tab_active : ""}
          type="button"
          onClick={() => setActivePanel("users")}
        >
          Users
        </button>
        <button
          className={activePanel === "brands" ? styles.admin__tab_active : ""}
          type="button"
          onClick={() => setActivePanel("brands")}
        >
          Brands
        </button>
      </div>

      {activePanel === "products" ? (
        <section className={styles.admin__grid}>
          <form className={styles.admin__form} onSubmit={handleSubmitProduct}>
            <h2>{editingProductId ? "Edit Product" : "Add Product"}</h2>
            <input
              value={productForm.name}
              placeholder="Product name"
              onChange={(event) =>
                setProductForm((form) => ({ ...form, name: event.target.value }))
              }
            />
            <input
              value={productForm.price || ""}
              placeholder="Price"
              type="number"
              min="0"
              step="0.01"
              onChange={(event) =>
                setProductForm((form) => ({
                  ...form,
                  price: Number(event.target.value),
                }))
              }
            />
            <input
              value={productForm.imageUrl}
              placeholder="Image URL"
              onChange={(event) =>
                setProductForm((form) => ({
                  ...form,
                  imageUrl: event.target.value,
                }))
              }
            />
            <input
              value={productForm.category}
              placeholder="Category"
              onChange={(event) =>
                setProductForm((form) => ({
                  ...form,
                  category: event.target.value,
                }))
              }
            />
            <select
              value={productForm.brandId}
              onChange={(event) =>
                setProductForm((form) => ({
                  ...form,
                  brandId: event.target.value,
                }))
              }
            >
              <option value="">No brand</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
            <textarea
              value={productForm.description}
              placeholder="Description"
              rows={4}
              onChange={(event) =>
                setProductForm((form) => ({
                  ...form,
                  description: event.target.value,
                }))
              }
            />
            <label className={styles.admin__checkbox}>
              <input
                type="checkbox"
                checked={productForm.isActive}
                onChange={(event) =>
                  setProductForm((form) => ({
                    ...form,
                    isActive: event.target.checked,
                  }))
                }
              />
              Active product
            </label>
            <div className={styles.admin__formActions}>
              <button type="submit" disabled={isMutating}>
                <FiCheck /> {editingProductId ? "Save" : "Create"}
              </button>
              {editingProductId ? (
                <button
                  type="button"
                  disabled={isMutating}
                  onClick={() => {
                    setEditingProductId(null);
                    setProductForm(emptyProductForm);
                  }}
                >
                  <FiX /> Cancel
                </button>
              ) : null}
            </div>
          </form>

          <div className={styles.admin__panel}>
            <div className={styles.admin__panelHeader}>
              <h2>Products</h2>
              <select
                value={productStatusFilter}
                disabled={isProductsLoading}
                onChange={(event) => setProductStatusFilter(event.target.value)}
              >
                {productStatusOptions.map((option) => (
                  <option key={option.value || "ALL"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.admin__list}>
              {isProductsLoading ? (
                <p className={styles.admin__inlineState}>Loading products...</p>
              ) : null}
              {!isProductsLoading && products.length === 0 ? (
                <p className={styles.admin__inlineState}>No products found.</p>
              ) : null}
              {!isProductsLoading
                ? products.map((product) => (
                    <article
                      className={styles.admin__row}
                      key={productIdOf(product)}
                    >
                      <img
                        src={product.imageUrl || "/vite.svg"}
                        alt=""
                        className={styles.admin__thumb}
                      />
                      <div>
                        <h3>{product.name}</h3>
                        <p>
                          {brandNameOf(product)} |{" "}
                          {product.category || "Unsorted"}
                        </p>
                        <span>{product.status || "APPROVED"}</span>
                      </div>
                      <div className={styles.admin__rowActions}>
                        <button
                          type="button"
                          title="Edit product"
                          aria-label={`Edit ${product.name}`}
                          disabled={isMutating}
                          onClick={() => handleEditProduct(product)}
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          type="button"
                          title="Approve product"
                          aria-label={`Approve ${product.name}`}
                          disabled={isMutating}
                          onClick={() =>
                            void runAction(
                              () => adminApi.approveProduct(productIdOf(product)),
                              "Product approved",
                            )
                          }
                        >
                          <FiCheck />
                        </button>
                        <button
                          type="button"
                          title="Reject product"
                          aria-label={`Reject ${product.name}`}
                          disabled={isMutating}
                          onClick={() =>
                            void runAction(
                              () =>
                                adminApi.rejectProduct(
                                  productIdOf(product),
                                  "Rejected from admin dashboard",
                                ),
                              "Product rejected",
                            )
                          }
                        >
                          <FiX />
                        </button>
                        <button
                          type="button"
                          title="Deactivate product"
                          aria-label={`Deactivate ${product.name}`}
                          disabled={isMutating}
                          onClick={() =>
                            void runAction(
                              () => adminApi.deleteProduct(productIdOf(product)),
                              "Product deactivated",
                            )
                          }
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </article>
                  ))
                : null}
            </div>
          </div>
        </section>
      ) : null}

      {activePanel === "users" ? (
        <section className={styles.admin__panel}>
          <h2>Users</h2>
          <div className={styles.admin__list}>
            {isUsersLoading ? (
              <p className={styles.admin__inlineState}>Loading users...</p>
            ) : null}
            {!isUsersLoading && users.length === 0 ? (
              <p className={styles.admin__inlineState}>No users found.</p>
            ) : null}
            {!isUsersLoading
              ? users.map((adminUser) => (
                  <article className={styles.admin__row} key={adminUser.userId}>
                    <div className={styles.admin__avatar}>
                      {adminUser.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <h3>{adminUser.name || "User"}</h3>
                      <p>{adminUser.email}</p>
                      <span>{adminUser.isBanned ? "Banned" : "Active"}</span>
                    </div>
                    <div className={styles.admin__rowActions}>
                      <select
                        value={normalizeRole(adminUser.role) || "USER"}
                        disabled={isMutating}
                        onChange={(event) =>
                          void runAction(
                            () =>
                              adminApi.setUserRole(
                                adminUser.userId,
                                event.target.value,
                              ),
                            "User role updated",
                            [loadStats, loadUsers],
                          )
                        }
                      >
                        <option value="USER">User</option>
                        <option value="MODERATOR">Moderator</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                      <button
                        type="button"
                        disabled={isMutating}
                        onClick={() =>
                          void runAction(
                            () =>
                              adminApi.setUserBan(
                                adminUser.userId,
                                !adminUser.isBanned,
                              ),
                            adminUser.isBanned ? "User unbanned" : "User banned",
                            [loadStats, loadUsers],
                          )
                        }
                      >
                        {adminUser.isBanned ? <FiCheck /> : <FiSlash />}
                      </button>
                    </div>
                  </article>
                ))
              : null}
          </div>
        </section>
      ) : null}

      {activePanel === "brands" ? (
        <section className={styles.admin__grid}>
          <form className={styles.admin__form} onSubmit={handleSubmitBrand}>
            <h2>{editingBrand ? "Edit Brand" : "Add Brand"}</h2>
            <input
              value={brandName}
              placeholder="Brand name"
              onChange={(event) => setBrandName(event.target.value)}
            />
            <div className={styles.admin__formActions}>
              <button type="submit" disabled={isMutating}>
                <FiCheck /> {editingBrand ? "Save" : "Create"}
              </button>
              {editingBrand ? (
                <button
                  type="button"
                  disabled={isMutating}
                  onClick={() => {
                    setEditingBrand(null);
                    setBrandName("");
                  }}
                >
                  <FiX /> Cancel
                </button>
              ) : null}
            </div>
          </form>
          <div className={styles.admin__panel}>
            <h2>Brands</h2>
            <div className={styles.admin__list}>
              {isBrandsLoading ? (
                <p className={styles.admin__inlineState}>Loading brands...</p>
              ) : null}
              {!isBrandsLoading && brands.length === 0 ? (
                <p className={styles.admin__inlineState}>No brands found.</p>
              ) : null}
              {!isBrandsLoading
                ? brands.map((brand) => (
                    <article className={styles.admin__row} key={brand.id}>
                      <div className={styles.admin__avatar}>
                        {brand.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3>{brand.name}</h3>
                        <p>{brand.id}</p>
                      </div>
                      <div className={styles.admin__rowActions}>
                        <button
                          type="button"
                          disabled={isMutating}
                          onClick={() => {
                            setEditingBrand(brand);
                            setBrandName(brand.name);
                          }}
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          type="button"
                          disabled={isMutating}
                          onClick={() =>
                            void runAction(
                              () => adminApi.deleteBrand(brand.id),
                              "Brand deleted",
                              [loadStats, loadBrands, loadProducts],
                            )
                          }
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </article>
                  ))
                : null}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
};
