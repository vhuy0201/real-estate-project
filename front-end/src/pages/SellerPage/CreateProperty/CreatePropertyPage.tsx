import React, { useRef, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { FiArrowLeft, FiHome, FiImage, FiCheckCircle } from 'react-icons/fi';

import FormProperty from '@/components/seller/CreateProperty/FormProperty';
import SelectImages from '@/components/seller/CreateProperty/SelectImages';
import { createProperty } from '@/services/propertyService';
import type { PropertyData } from '@/types/PropertyData';
import useTitle from '@/hooks/useTitle';

interface ImageItem {
    id: string;
    url: string;
    file: File;
}

const initialFormData: PropertyData = {
    title: '',
    price: '',
    description: '',
    address: '',
    bathrooms: '1',
    bedrooms: '1',
    area: '1',
    unit: 'm2',
    floors: '1',
    yearBuilt: '',
    city_id: '',
    district_id: '',
    ward_id: '',
    category_id: '',
    type_id: '',
    features: [],
    coordinates: undefined,
};

const CreatePropertyPage = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [propertyData, setPropertyData] = useState<PropertyData>(initialFormData);
    const [images, setImages] = useState<ImageItem[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { t } = useTranslation('createPropertyPage');
    const navigate = useNavigate();
    const isSubmittingRef = useRef(false);
    const totalSteps = 2;

    useTitle(t('createProperty.pageTitle'));

    const handleNextStep = () => {
        if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
    };

    const handlePreviousStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const handleFormSubmit = (data: PropertyData) => {
        setPropertyData(data);
        handleNextStep();
    };

    const handleImagesSubmit = async (imageList: ImageItem[]) => {
        setImages(imageList);
        await handleFinalSubmit(imageList);
    };

    const handleFinalSubmit = async (submittedImages: ImageItem[] = images) => {
        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;
        setIsSubmitting(true);

        try {
            if (!propertyData.city_id || !propertyData.category_id || !propertyData.type_id) {
                toast.error(t('createProperty.alerts.missingRequired'));
                setIsSubmitting(false);
                return;
            }

            const imageFiles = submittedImages.map(img => img.file);
            const dataToSend = { ...propertyData };

            const response = await createProperty(dataToSend, imageFiles);
            console.log('Created property:', response);

            setPropertyData(initialFormData);
            setImages([]);
            setCurrentStep(1);
            setIsSubmitting(false);

            const toastId = toast.success(
                <div className="space-y-2">
                    <p className="font-medium">{t('createProperty.alerts.createSuccess')}</p>
                    <div className="flex gap-3 mt-2">
                        <button
                            onClick={() => toast.dismiss(toastId)}
                            className="px-3 py-1 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 transition"
                        >
                            {t('createProperty.buttons.createNew')}
                        </button>
                        <button
                            onClick={() => {
                                toast.dismiss(toastId);
                                navigate('/seller/properties');
                            }}
                            className="px-3 py-1 rounded-md bg-gray-300 text-gray-800 text-sm hover:bg-gray-400 transition"
                        >
                            {t('createProperty.buttons.viewList')}
                        </button>
                    </div>
                </div>,
                { autoClose: 6000, closeOnClick: false, pauseOnHover: true }
            );

        } catch (error: any) {
            console.error('Error creating property:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra';
            toast.error(`${t('createProperty.alerts.createError')}: ${errorMessage}`);
            setIsSubmitting(false);
        } finally {
            isSubmittingRef.current = false;
            setIsSubmitting(false);
        }
    };

    const steps = [
        { number: 1, title: t('createProperty.steps.1'), icon: FiHome },
        { number: 2, title: t('createProperty.steps.2'), icon: FiImage },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header with Back Button */}
                <div className="mb-6 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/seller/properties')}
                        className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 group"
                    >
                        <FiArrowLeft className="text-blue-600 group-hover:-translate-x-1 transition-transform duration-200" />
                        <span className="text-gray-700 font-medium">{t('createProperty.buttons.back')}</span>
                    </button>
                    <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-lg shadow-md">
                        {t('createProperty.step')} <span className="font-bold text-blue-600">{currentStep}</span> / {totalSteps}
                    </div>
                </div>

                {/* Main Title */}
                <div className="text-center mb-8 animate-fadeIn">
                    <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400 mb-2">
                        {t('createProperty.pageTitle')}
                    </h1>
                    <p className="text-gray-600">{t('createProperty.subtitle')}</p>
                </div>

                {/* Progress Steps */}
                <div className="mb-10 bg-white rounded-xl shadow-lg p-6 md:p-8 animate-fadeIn">
                    <div className="flex items-center justify-between relative">
                        {steps.map((step, index) => {
                            const StepIcon = step.icon;
                            const isCompleted = currentStep > step.number;
                            const isActive = currentStep === step.number;

                            return (
                                <React.Fragment key={step.number}>
                                    <div className="flex flex-col items-center flex-1 relative z-10">
                                        <div
                                            className={`
                                                w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center 
                                                font-semibold text-lg transition-all duration-300 shadow-lg
                                                ${isCompleted
                                                    ? 'bg-gradient-to-r from-green-500 to-green-400 text-white scale-110'
                                                    : isActive
                                                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white scale-110 ring-4 ring-blue-200'
                                                        : 'bg-gray-200 text-gray-500'
                                                }
                                            `}
                                        >
                                            {isCompleted ? (
                                                <FiCheckCircle className="text-2xl" />
                                            ) : (
                                                <StepIcon className="text-xl md:text-2xl" />
                                            )}
                                        </div>
                                        <p className={`
                                            mt-3 text-xs md:text-sm font-semibold text-center max-w-[100px]
                                            ${isActive || isCompleted ? 'text-blue-600' : 'text-gray-500'}
                                        `}>
                                            {step.title}
                                        </p>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className="flex-1 h-1.5 mx-4 rounded-full bg-gray-200 relative -mt-8">
                                            <div
                                                className={`
                                                    h-full rounded-full transition-all duration-500 
                                                    ${currentStep > step.number
                                                        ? 'bg-gradient-to-r from-green-500 to-blue-500 w-full'
                                                        : 'w-0'
                                                    }
                                                `}
                                            />
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                {/* Form Content */}
                <div className="mb-6 animate-fadeIn">
                    {currentStep === 1 && (
                        <FormProperty
                            initialData={propertyData}
                            onSubmit={handleFormSubmit}
                        />
                    )}
                    {currentStep === 2 && (
                        <SelectImages
                            images={images}
                            onSubmit={handleImagesSubmit}
                            onBack={handlePreviousStep}
                            isSubmitting={isSubmitting}
                        />
                    )}
                </div>
            </div>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </div>
    );
};

export default CreatePropertyPage;
