export function formatVND(amount: number) {
  return new Intl.NumberFormat("vi-VN").format(amount) + " VND";
}
