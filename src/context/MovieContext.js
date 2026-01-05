import React, { createContext, useContext } from "react";

export const MovieContext = createContext();

const allMovies = [
  {
    id: 1,
    title: "Thanh Gươm Diệt Quỷ",
    engTitle: "Demon Slayer",
    genre: "Anime, Hành động",
    country: "Nhật Bản",
    duration: "24 phút/tập",
    year: 2023,
    image: "https://cinema.momocdn.net/img/2995715139969098-conmemay.jpg",
    banner:"https://cdn.animevietsub.show/data/banner/2023/03/31/animevsub-2ZBCATQ2yj.jpg",
    videoUrl: "https://dsvplay.com/d/tq8v6ba7u2hc",
    backupUrls: [
      "https://www.youtube.com/embed/jzBeQHkEi2E",
      "https://www.dailymotion.com/embed/video/x8p06so",
    ],
    description:
      "Câu chuyện về Tanjiro và hành trình tiêu diệt quỷ để cứu em gái Nezuko khỏi lời nguyền đáng sợ.",
  },
  {
    id: 2,
    title: "Attack On Titan",
    engTitle: "Shingeki no Kyojin",
    genre: "Anime, Hành động, Viễn tưởng",
    country: "Nhật Bản",
    duration: "25 phút/tập",
    year: 2013,
    image:
      "https://assets.wfcdn.com/im/76220912/compr-r85/6207/62075932/Entertainment+Paper+Print.jpg",
    banner:"https://cdn.animevietsub.show/data/big_banner/2020/09/30/animevsub-03RXvbURRL.jpg",
    videoUrl: "https://dsvplay.com/d/8npatwfbaxap",
    backupUrls: [
      "https://www.youtube.com/embed/cb7b2lZ0KDY",
      "https://www.dailymotion.com/embed/video/x8oueqc",
    ],
    description:
      "Eren Yeager và bạn bè chiến đấu giành lại tự do khi nhân loại bị đe dọa bởi các Titan khổng lồ.",
  },
  {
    id: 3,
    title: "Jujutsu Kaisen",
    engTitle: "Chú Thuật Hồi Chiến",
    genre: "Anime, Siêu nhiên, Hành động",
    country: "Nhật Bản",
    duration: "24 phút/tập",
    year: 2021,
    image:
      "https://static0.gamerantimages.com/wordpress/wp-content/uploads/2023/09/jujutsu-kaisen.jpg",
    banner:"https://cdn.animevietsub.show/data/big_banner/2021/02/28/animevsub-e0SoZMFSgf.jpg",
    videoUrl: "https://dsvplay.com/d/om4ayhlg1djp",
    backupUrls: [
      "https://www.youtube.com/embed/kSAvzeopPC4",
      "https://www.dailymotion.com/embed/video/x8p08o9",
    ],
    description:
      "Itadori Yuji trở thành vật chứa của Sukuna – chú thuật sư mạnh nhất, và bước vào thế giới đầy nguyền rủa.",
  },
  {
    id: 4,
    title: "Naruto Shippuden",
    engTitle: "Naruto Shippuden",
    genre: "Anime, Phiêu lưu, Hành động",
    country: "Nhật Bản",
    duration: "25 phút/tập",
    year: 2007,
    image:
      "https://tiermaker.com/images/templates/naruto-season-2-887103/8871031620327578.jpg",
    banner:"https://cdn.animevietsub.show/data/big_banner/2017/08/03/animevsub-big_banner-9184.jpg",
    videoUrl: "https://dsvplay.com/d/vc390wf055jx",
    backupUrls: [
      "https://www.youtube.com/embed/x4z24ZpMZlw",
      "https://www.dailymotion.com/embed/video/x8ov33x",
    ],
    description:
      "Naruto trưởng thành và tiếp tục hành trình trở thành Hokage, cùng bạn bè chống lại các thế lực đen tối.",
  },
  {
  id: 5,
  title: "Thám Tử Lừng Danh Conan",
  engTitle: "Detective Conan",
  genre: "Anime, Trinh thám, Hành động",
  country: "Nhật Bản",
  duration: "25 phút/tập",
  year: 1996,
  image:
    "https://i.pinimg.com/736x/14/ab/c2/14abc2c2e1b932016158832ff2c1b159.jpg",
  banner:"https://cdn.animevietsub.show/data/big_banner/2019/08/26/animevsub-hbTJKkndht.jpg",
  videoUrl: "https://dsvplay.com/d/q8uy106kfdd3",
  backupUrls: [
    "https://www.youtube.com/embed/YoU_XksL2-U",
    "https://www.dailymotion.com/embed/video/x8pqf0n",
  ],
  description:
    "Shinichi Kudo – thám tử trung học thiên tài – bị thu nhỏ thành Conan và tiếp tục phá án để tìm ra tổ chức Áo Đen.",
},

  {
    id: 6,
    title: "Avengers: Endgame",
    engTitle: "Avengers: Endgame",
    genre: "Hành động, Khoa học viễn tưởng",
    country: "Mỹ",
    duration: "3 giờ 1 phút",
    year: 2019,
    image:
      "https://tse1.mm.bing.net/th/id/OIP.7A-uPhP4iCQY9pqdmCtbfQHaK9",
    banner:"https://static.nutscdn.com/vimg/0-0/0853139290ef0a7a0130ba4cdc26a47e.jpg",
    videoUrl: "https://dsvplay.com/d/q8qjhy2ihkjw",
    backupUrls: [
      "https://www.youtube.com/embed/0jNvJU52LvU",
      "https://www.dailymotion.com/embed/video/x8p09pn",
    ],
    description:
      "Các siêu anh hùng hợp lực chống lại Thanos để cứu lấy vũ trụ trong trận chiến cuối cùng.",
  },
];

export const MovieProvider = ({ children }) => (
  <MovieContext.Provider value={{ allMovies }}>
    {children}
  </MovieContext.Provider>
);

export const useMovies = () => useContext(MovieContext);
