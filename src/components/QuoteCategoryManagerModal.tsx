import { Modal } from "antd";
import { type FormEvent, useState } from "react";
import { createQuoteCategory, deleteQuoteCategory, type QuoteCategory } from "../services/portalApi";
import { showRequestToast } from "../utils/portalToast";

type QuoteCategoryManagerModalProps = {
  categories: QuoteCategory[];
  onCategoriesChange: (categories: QuoteCategory[]) => void;
  onClose: () => void;
  open: boolean;
};

function sortCategories(categories: QuoteCategory[]) {
  return [...categories].sort((a, b) => a.name.localeCompare(b.name));
}

function QuoteCategoryManagerModal({ categories, onCategoriesChange, onClose, open }: QuoteCategoryManagerModalProps) {
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();

    if (!trimmed) {
      return;
    }

    const toast = showRequestToast("create-quote-category", "Adding category...");

    try {
      setIsSaving(true);
      const category = await createQuoteCategory(trimmed);
      onCategoriesChange(sortCategories([...categories, category]));
      setName("");
      toast.success(`Category "${category.name}" added.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to add category.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleDelete(category: QuoteCategory) {
    Modal.confirm({
      title: "Delete category?",
      content: `Delete "${category.name}"? Quotes and invoices tagged with it will become uncategorized.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        const toast = showRequestToast(`delete-quote-category-${category.id}`, "Deleting category...");

        try {
          setDeletingId(category.id);
          await deleteQuoteCategory(category.id);
          onCategoriesChange(categories.filter((item) => item.id !== category.id));
          toast.success(`Category "${category.name}" deleted.`);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Unable to delete category.");
        } finally {
          setDeletingId(null);
        }
      },
    });
  }

  return (
    <Modal footer={null} maskClosable={false} onCancel={onClose} open={open} title="Job categories" width={520}>
      <div className="admin-modal-form">
        <form className="quote-category-manager__form" onSubmit={handleAdd}>
          <input
            aria-label="New category name"
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Residential, Commercial, Renovation"
            type="text"
            value={name}
          />
          <button className="primary-action" disabled={isSaving || !name.trim()} type="submit">
            {isSaving ? "Adding..." : "Add"}
          </button>
        </form>

        {categories.length ? (
          <ul className="quote-category-manager__list">
            {categories.map((category) => (
              <li key={category.id}>
                <span>{category.name}</span>
                <button
                  className="secondary-action-btn"
                  disabled={deletingId === category.id}
                  onClick={() => handleDelete(category)}
                  type="button"
                >
                  {deletingId === category.id ? "Deleting..." : "Delete"}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="admin-empty-copy">No categories yet. Add one above.</p>
        )}
      </div>
    </Modal>
  );
}

export default QuoteCategoryManagerModal;
