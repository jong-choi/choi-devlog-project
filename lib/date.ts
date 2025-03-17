import dayjs from "dayjs";
import "dayjs/locale/ko";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("ko");

// 한국 시간 변환 함수
export const formatKoreanDate = (time?: string | number) => {
  return dayjs.utc(time).tz("Asia/Seoul").format("YYYY.MM.DD HH:mm:ss");
};

export default dayjs;
