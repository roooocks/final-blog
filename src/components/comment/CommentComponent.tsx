import { format } from "date-fns";
import { Trash } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

export default function CommentComponent({
  author,
  _id,
  content,
  createdAt,
  deleteComment
}: Comment & {
  deleteComment: (id: string) => void;
}) {
  const user = useAuthStore(state => state.user);

  return (
    <div className="mb-6">
      <div className="flex gap-4">
        <img
          alt={author.nickname}
          className="w-10 h-10 rounded-full"
          src={author.profileImage}
        />
        <div className="flex-1">
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-white">{author.nickname}</span>
              <span className="text-sm text-gray-400">{format(new Date(createdAt), 'yyyy-MM-dd HH:mm')}</span>
            </div>
            <p className="text-gray-300">{content}</p>
          </div>
          {author._id === user?.id && (
            <div className="flex items-center gap-4 mt-2">
              <button
                className="flex items-center gap-1 text-sm text-gray-400 hover:text-blue-400 transition-colors"
                onClick={() => deleteComment(_id)}
              >
                <Trash className="w-4 h-4" aria-hidden="true" />
                삭제
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
