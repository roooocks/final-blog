import axios from "axios";
import { ImagePlus, Loader2 } from "lucide-react";
import React, { useEffect, useState, useTransition } from "react";
import { useLoaderData, useNavigate } from "react-router";
import { axiosInstance } from "../../../api/axios";

const categories = [
  "Technology",
  "Lifestyle",
  "Travel",
  "Business",
  "Economy",
  "Sports",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

interface FormStateType {
  title: string;
  category: string;
  thumbnail: string;
  content: string;
}

export default function PostCreate() {
  const navigate = useNavigate();
  const post = useLoaderData<Post>();

  // 기본값 지정이 싫다면 0번째를 ""로 두고 조건식으로 걸러낼 수 있다.
  const [formState, setFormState] = useState<FormStateType>({
    title: "",
    category: categories[0],
    thumbnail: "",
    content: ""
  });
  const [errorState, setErrorState] = useState<FormStateType>({
    title: "",
    category: "",
    thumbnail: "",
    content: ""
  });
  const [previewImage, setPreviewImage] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleChangeFormState = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormState(formState => ({
      ...formState,
      [e.target.name]: e.target.value,
    }));
    setErrorState(errorState => ({ ...errorState, [e.target.name]: "" }));
  };

  const handleChangeImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      // console.log(selectedFile);
      return;
    }

    // 파일 타입 제한
    const allowExtensions = ['png', 'webp', 'jpeg', 'jpg'];
    const fileExtensoin = selectedFile.name.split('.').pop()?.toLowerCase(); // 강제 소문자
    if (!fileExtensoin || !allowExtensions.includes(fileExtensoin)) {
      alert(`허용된 이미지 확장자는 ${allowExtensions.join(', ')}입니다.`);
      return;
    }

    // 파일 크기 제한
    if (selectedFile.size > MAX_FILE_SIZE) {
      alert('이미지 용량은 10MB 이하여야 합니다.');
      e.target.value = "";
      return;
    }

    // 파일 리더 객체가 해당 이미지를 읽어달라고 명령을 날리면 된다.
    const reader = new FileReader();
    reader.onloadend = () => {
      // onloadend는 이미지 읽기를 실패하던 성공하던 작업 다 끝난 후 작동한다.
      // 사실상 이 내용은 이벤트를 등록만 한거다.
      // console.log(reader.result as string);
      setErrorState(errorState => ({ ...errorState, thumbnail: '' }));
      setPreviewImage(reader.result as string);
    };

    // 가져온 이미지를 이해 가능한 문자열로 변환
    // 변환 = 이미지 => 문자열
    reader.readAsDataURL(selectedFile);
  };

  // Signup랑 비교하면서 공부(action 관련 내용)
  // 내용 변경 시 발생하는 값 변경 문제로 onSubmit으로 변경
  const handleFormAction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        // 유효성 검사
        const newErrors: FormStateType = {} as FormStateType;

        if (!formState.title.trim()) newErrors.title = 'Please enter a title.';
        if (!formState.category.trim()) newErrors.category = 'Please select a category.';
        if (!previewImage) newErrors.thumbnail = 'Please upload a thumbnail.';
        if (!formState.content.trim()) newErrors.content = 'Please enter a content.';

        if (Object.keys(newErrors).length > 0) {
          setErrorState(newErrors);
          return;
        }

        // 이미지 URL 저장
        // 이때 이미지는 cloudinary라는 외부 솔루션을 사용
        let thumbnail = post?.thumbnail || "";
        if (previewImage !== thumbnail) {
          const formData = new FormData();
          formData.append('file', previewImage);
          formData.append('upload_preset', 'react_blog');

          // axios 부분 아마 두꺼운 책 보면 이거 baseURL마다 나눈게 있을거다.
          const { data: { url } } = await axios.post('https://api.cloudinary.com/v1_1/dbkxwr4dr/image/upload', formData);
          thumbnail = url;
        }

        // post 여부에 따른 수정/추가
        if (post) {
          // 게시글 수정
          const { status } = await axiosInstance.put(`/posts/${post._id}`, {
            title: formState.title,
            category: formState.category,
            thumbnail: thumbnail,
            content: formState.content
          });

          if (status === 200) {
            // console.log(status);
            alert("Post updated!");
            navigate(`/post/${post._id}`);
          }
        } else {
          // 게시글 등록
          const { status } = await axiosInstance.post('/posts', {
            title: formState.title,
            category: formState.category,
            thumbnail: thumbnail,
            content: formState.content
          });

          if (status === 201) {
            // console.log(status);
            alert("Post added!");
            navigate('/');
          }
        }
      } catch (error) {
        console.error(error instanceof Error ? error.message : 'unknown error');
      }
    });
  };

  useEffect(() => {
    if (post) {
      setFormState({
        title: post.title,
        category: post.category,
        thumbnail: post.thumbnail,
        content: post.content
      });
      setPreviewImage(post.thumbnail);
    }
  }, [post]);

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
      <title>{post ? 'Modify a Post - SLUG' : 'Create a Post - SLUG'}</title>
      <h1 className="text-3xl font-bold text-white mb-8">Write {post ? 'Modify' : 'New'} Post</h1>

      {/* action을 쓰면 강제적으로 값을 넣어 적용하는 value 부분에서 문제가 생긴다. */}
      {/* 일반적인 경우는 안생기는데, 여기서는 수정(이미지 삭제 후 업로드를 해보자) 시 카테고리가 바뀌는 문제가 있다. */}
      {/* 이런 예외적인 경우에는 onSubmit를 써준다고 한다. */}
      <form className="space-y-6" onSubmit={handleFormAction}>
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            className="w-full bg-slate-800 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter post title"
            required
            value={formState.title}
            onChange={handleChangeFormState}
          />
          {errorState?.title && <p className="text-rose-500 mt-1">{errorState.title}</p>}
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Category
          </label>
          <select
            id="category"
            name="category"
            className="w-full bg-slate-800 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
            value={formState.category}
            onChange={handleChangeFormState}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errorState?.category && <p className="text-rose-500 mt-1">{errorState.category}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Featured Image
          </label>
          <div className="relative">
            {/* 이미지 선택 후 화면 (미리보기) */}
            {previewImage ? (
              <div className="relative w-full aspect-video mb-4">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                  onClick={() => setPreviewImage('')}
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  className="hidden"
                  onChange={handleChangeImage}
                />
                <label
                  htmlFor="image"
                  className="flex flex-col items-center cursor-pointer"
                >
                  <ImagePlus className="h-12 w-12 text-gray-400 mb-3" />
                  <span className="text-gray-300">Click to upload image</span>
                  <span className="text-gray-500 text-sm mt-1">
                    PNG, JPG, JPEG, WEBP up to 10MB
                  </span>
                </label>
              </div>
            )}
            {errorState?.thumbnail && <p className="text-rose-500 mt-1">{errorState.thumbnail}</p>}
          </div>
        </div>

        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Content
          </label>
          <textarea
            id="content"
            name="content"
            className="w-full h-96 bg-slate-800 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Write your post content here..."
            required
            value={formState.content}
            onChange={handleChangeFormState}
          />
          {errorState?.content && <p className="text-rose-500 mt-1">{errorState.content}</p>}
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              post ? 'Modify Post' : 'Publish Post'
            )}
          </button>
          <button
            type="button"
            className="px-6 py-2.5 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-600 transition-colors"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
