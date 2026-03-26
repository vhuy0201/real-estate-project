import React, { useRef, useState, type DragEvent, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { FiUploadCloud, FiX, FiImage } from 'react-icons/fi';

type ImageItem = {
    id: string;
    url: string;
    file: File;
};

interface SelectImagesProps {
    images: ImageItem[];
    onSubmit: (images: ImageItem[]) => void;
    onBack: () => void;
    isSubmitting?: boolean;
}

const SelectImages: React.FC<SelectImagesProps> = ({ images: initialImages, onSubmit, onBack, isSubmitting = false }) => {
    const [images, setImages] = useState<ImageItem[]>(() => initialImages);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const { t } = useTranslation("createPropertyPage");
    const handleFiles = (files: FileList | null) => {
        if (!files) return;

        const validFiles = Array.from(files).filter((file) =>
            file.type.startsWith("image/")
        );

        const newImages: ImageItem[] = validFiles
            .slice(0, 10 - images.length)
            .map((file) => ({
                id: Math.random().toString(36).substring(2),
                url: URL.createObjectURL(file),
                file,
            }));

        setImages((prev) => [...prev, ...newImages]);
    };

    const handleRemove = (id: string) => {
        setImages((prev) => prev.filter((img) => img.id !== id));
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => setDragOver(false);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
    };

    const handleSubmit = () => {
        if (images.length === 0) {
            toast.error(t("selectImages.alertEmpty"));
            return;
        }
        onSubmit(images);
    };

    return (
        <div className="bg-white shadow-xl rounded-2xl p-6 md:p-8 space-y-6 animate-fadeIn">
            <div className="text-center border-b border-gray-200 pb-4">
                <div className="flex items-center justify-center mb-3">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
                        <FiImage className="text-3xl text-white" />
                    </div>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400 mb-2">
                    {t("selectImages.title")}
                </h1>
                <p className="text-sm text-gray-500">{t("selectImages.subtitle", { count: images.length })}</p>
            </div>

            <div className="space-y-4">
                {/* Upload Area */}
                <div
                    className={`
                        border-3 border-dashed rounded-xl p-12 text-center transition-all duration-300 relative overflow-hidden
                        ${isSubmitting
                            ? "cursor-not-allowed opacity-50 border-gray-300 bg-gray-100"
                            : dragOver
                                ? "cursor-pointer border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 scale-[1.02]"
                                : "cursor-pointer border-gray-300 bg-gradient-to-br from-gray-50 to-white hover:border-blue-400 hover:bg-blue-50"
                        }
                    `}
                    onDrop={isSubmitting ? undefined : handleDrop}
                    onDragOver={isSubmitting ? undefined : handleDragOver}
                    onDragLeave={isSubmitting ? undefined : handleDragLeave}
                    onClick={isSubmitting ? undefined : () => fileInputRef.current?.click()}
                >
                    <div className="relative z-10">
                        <FiUploadCloud className={`mx-auto text-6xl mb-4 transition-all duration-300 ${dragOver ? 'text-blue-600 scale-110' : 'text-blue-400'}`} />
                        <p className="text-gray-700 font-medium text-lg mb-2">
                            {t("selectImages.dragText")}
                        </p>
                        <p className="text-gray-500 text-sm mb-4">
                            or
                        </p>
                        <span className="inline-block px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
                            {t("selectImages.chooseFile")}
                        </span>
                        <p className="text-xs text-gray-400 mt-4">
                            {t("selectImages.maxFiles")} • JPG, PNG, GIF
                        </p>
                    </div>
                    <input
                        title="file"
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleInputChange}
                    />
                </div>

                {/* Image Preview Grid */}
                {images.length > 0 && (
                    <div className="animate-fadeIn">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-gray-700">
                                {t("selectImages.preview")} ({images.length})
                            </h3>
                            {images.length >= 10 && (
                                <span className="text-xs text-orange-600 font-medium bg-orange-50 px-3 py-1 rounded-full">
                                    {t("selectImages.limitReached")}
                                </span>
                            )}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {images.map((img, index) => (
                                <div
                                    key={img.id}
                                    className={`
                                        relative rounded-xl overflow-hidden group shadow-md hover:shadow-xl transition-all duration-300
                                        ${isSubmitting ? 'opacity-75' : 'hover:scale-105'}
                                    `}
                                >
                                    <div className="aspect-square">
                                        <img
                                            src={img.url}
                                            alt={`preview ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    {index === 0 && (
                                        <div className="absolute top-2 left-2 bg-gradient-to-r from-green-500 to-green-400 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                                            {t("selectImages.primary")}
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                                    {!isSubmitting && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemove(img.id);
                                            }}
                                            aria-label={t('selectImages.remove')}
                                            className="absolute top-2 right-2 z-10 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg hover:bg-red-600 hover:scale-110"
                                        >
                                            <FiX className="text-lg" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-gray-200 flex justify-between items-center">
                <button
                    type="button"
                    onClick={onBack}
                    disabled={isSubmitting}
                    className="flex items-center space-x-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                    </svg>
                    <span>{t("createProperty.buttons.back")}</span>
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || images.length === 0}
                    className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                    {isSubmitting ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>{t("selectImages.submitting")}</span>
                        </>
                    ) : (
                        <>
                            <span>{t("selectImages.finish")}</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default SelectImages;
