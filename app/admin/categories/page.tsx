import { getCategories } from "@/lib/categories"
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "./actions"
import NewCategoryPanel from "./components/NewCategoryPanel"
import CategoryRow from "./components/CategoryRow"

export const metadata = {
  title: "Categories",
}

export default async function AdminCategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl lg:text-3xl font-medium text-[#111111]">
            Categories
          </h1>
          <p className="text-sm text-[#8C8C8C] mt-1">
            {categories.length} categor{categories.length !== 1 ? "ies" : "y"}
          </p>
        </div>
        <NewCategoryPanel createAction={createCategoryAction} />
      </div>

      {/* Table */}
      {categories.length === 0 ? (
        <div className="bg-white border border-[#e5e5e5] rounded p-12 text-center">
          <p className="text-sm text-[#8C8C8C]">No categories yet.</p>
          <p className="text-xs text-[#aaa] mt-1">
            Add your first category using the button above.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#e5e5e5] rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e5e5e5] bg-[#F8F5F2]">
                <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium">
                  Name
                </th>
                <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium hidden sm:table-cell">
                  Slug
                </th>
                <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium hidden md:table-cell">
                  Products
                </th>
                <th className="text-right px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ece4]">
              {categories.map((category) => (
                <CategoryRow
                  key={category.id}
                  category={category}
                  updateAction={updateCategoryAction}
                  deleteAction={deleteCategoryAction}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
