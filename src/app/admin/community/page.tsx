import { getCommunity } from '@/lib/site-content'
import { CommunityForm } from './CommunityForm'

export default async function AdminCommunityPage() {
  const images = await getCommunity()

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-xl font-semibold tracking-wide mb-2">Community</h1>
      <p className="text-sm text-gray-500 mb-8">
        Photos of customers wearing Lusiant. These show in the “Community” gallery on the home page.
      </p>
      <CommunityForm initialImages={images} />
    </div>
  )
}
