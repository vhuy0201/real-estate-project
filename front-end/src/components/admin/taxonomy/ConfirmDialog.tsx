import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
} from "@mui/material";

interface Props {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    message: string;
}

export default function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    message,
}: Props) {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Xác nhận</DialogTitle>
            <DialogContent>
                <Typography>{message}</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Hủy</Button>
                <Button onClick={onConfirm} color="error" variant="contained">
                    Xóa
                </Button>
            </DialogActions>
        </Dialog>
    );
}
