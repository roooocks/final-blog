interface Author {
  _id: string;
  profileImage: string;
  nickname: string;
}

interface Comment {
  author: Author;
  content: string;
  _id: string;
  createdAt: string;
}

interface Post {
  _id: string;
  title: string;
  category: string;
  thumbnail: string;
  content: string;
  author: Author;
  comments: Comment[];
  viewCount: number;
  createdAt: string;
}

interface Pagination {
  totalCount: number;
  currentPage: number;
  perPage: number;
  maxPage: number;
}
