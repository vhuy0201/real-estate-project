import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Formik } from "formik";
import * as Yup from "yup";
import { Property } from "../../types/property";
import { CreateOfferDto } from "../../types/offer";

interface OfferFormProps {
  property: Property;
  onSubmit: (data: CreateOfferDto) => Promise<void>;
  isLoading?: boolean;
}

const validationSchema = Yup.object().shape({
  amount: Yup.number()
    .required("Giá đề xuất là bắt buộc")
    .min(1, "Giá phải lớn hơn 0"),
  validityPeriod: Yup.string().required("Thời gian hiệu lực là bắt buộc"),
  note: Yup.string().max(500, "Ghi chú không được vượt quá 500 ký tự"),
});

export const OfferForm: React.FC<OfferFormProps> = ({
  property,
  onSubmit,
  isLoading = false,
}) => {
  const propertyTitle =
    (property.title as any)?.vi || (property.title as any)?.en || property.title;

  // Set default validity period to 30 days from now
  const defaultExpiryDate = new Date();
  defaultExpiryDate.setDate(defaultExpiryDate.getDate() + 30);
  const defaultExpiryStr = defaultExpiryDate.toISOString().split("T")[0];

  const initialValues = {
    amount: "",
    validityPeriod: defaultExpiryStr,
    note: "",
  };

  const handleSubmit = async (values: any) => {
    try {
      const expiresAt = new Date(values.validityPeriod).toISOString();

      await onSubmit({
        propertyId: property._id,
        amount: parseFloat(values.amount),
        note: values.note || undefined,
        currency: "VND",
        expiresAt,
        attachments: [],
        meta: {},
      });
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Không thể gửi offer");
    }
  };

  // Format currency for display
  const formatCurrency = (value: string): string => {
    if (!value) return "";
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return value;
    return new Intl.NumberFormat("vi-VN").format(numValue);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Property Info Section */}
      <View style={styles.propertyInfoSection}>
        <Text style={styles.propertyTitle}>{propertyTitle}</Text>

        <View style={styles.priceBox}>
          <View style={styles.priceIconWrapper}>
            <Ionicons name="pricetag" size={18} color="#0ea5e9" />
          </View>
          <View>
            <Text style={styles.priceLabel}>Giá niêm yết</Text>
            <Text style={styles.priceValue}>
              {new Intl.NumberFormat("vi-VN").format(property.price)} ₫
            </Text>
          </View>
        </View>

        {/* Property details grid */}
        <View style={styles.detailsGrid}>
          {property.bedrooms && (
            <View style={styles.detailItem}>
              <View style={[styles.detailIcon, { backgroundColor: "#fee2e2" }]}>
                <Ionicons name="bed" size={16} color="#dc2626" />
              </View>
              <Text style={styles.detailText}>{property.bedrooms} Phòng</Text>
            </View>
          )}
          {property.area && (
            <View style={styles.detailItem}>
              <View style={[styles.detailIcon, { backgroundColor: "#dcfce7" }]}>
                <Text style={styles.detailIconText}>▭</Text>
              </View>
              <Text style={styles.detailText}>{property.area} m²</Text>
            </View>
          )}
          {property.bathrooms && (
            <View style={styles.detailItem}>
              <View style={[styles.detailIcon, { backgroundColor: "#cffafe" }]}>
                <Ionicons name="water" size={16} color="#0369a1" />
              </View>
              <Text style={styles.detailText}>{property.bathrooms} WC</Text>
            </View>
          )}
          {property.floors && (
            <View style={styles.detailItem}>
              <View style={[styles.detailIcon, { backgroundColor: "#fef3c7" }]}>
                <Ionicons name="layers" size={16} color="#b45309" />
              </View>
              <Text style={styles.detailText}>{property.floors} Tầng</Text>
            </View>
          )}
        </View>
      </View>

      {/* Form Section */}
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleSubmit }) => (
          <View style={styles.formSection}>
            {/* Proposed Price */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Giá đề xuất <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="cash"
                  size={18}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập giá đề xuất (VNĐ)"
                  keyboardType="number-pad"
                  value={values.amount}
                  onChangeText={handleChange("amount")}
                  editable={!isLoading}
                />
                {values.amount && (
                  <Text style={styles.formattedPrice}>
                    {formatCurrency(values.amount)} ₫
                  </Text>
                )}
              </View>
              {touched.amount && errors.amount && (
                <Text style={styles.errorText}>{errors.amount}</Text>
              )}
            </View>

            {/* Validity Period */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Thời hạn hiệu lực <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="calendar"
                  size={18}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={values.validityPeriod}
                  onChangeText={handleChange("validityPeriod")}
                  editable={!isLoading}
                />
              </View>
              <Text style={styles.helperText}>
                Offer sẽ tự động hết hạn sau ngày này
              </Text>
              {touched.validityPeriod && errors.validityPeriod && (
                <Text style={styles.errorText}>{errors.validityPeriod}</Text>
              )}
            </View>

            {/* Notes (Optional) */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Ghi chú (Tùy chọn)</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.input, { minHeight: 100, paddingTop: 12 }]}
                  placeholder="Thêm ghi chú hoặc điều kiện đặc biệt..."
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                  value={values.note}
                  onChangeText={handleChange("note")}
                  editable={!isLoading}
                />
              </View>
              <Text style={styles.charCount}>
                {values.note.length}/500 ký tự
              </Text>
              {touched.note && errors.note && (
                <Text style={styles.errorText}>{errors.note}</Text>
              )}
            </View>

            {/* Important Notes Alert */}
            <View style={styles.alertBox}>
              <View style={styles.alertHeader}>
                <Ionicons name="warning" size={18} color="#f59e0b" />
                <Text style={styles.alertTitle}>Lưu ý quan trọng</Text>
              </View>
              <Text style={styles.alertText}>
                • Đề xuất giá hợp lý (80-95% giá niêm yết) để tăng khả năng được
                chấp nhận
              </Text>
              <Text style={styles.alertText}>
                • Agent sẽ xem xét và chuyển đến chủ nhà
              </Text>
              <Text style={styles.alertText}>
                • Offer có thể hủy khi đang chờ xử lý
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                isLoading && styles.submitButtonDisabled,
              ]}
              onPress={() => handleSubmit()}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Ionicons name="send" size={18} color="white" />
                  <Text style={styles.submitButtonText}>Gửi Offer</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </Formik>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  propertyInfoSection: {
    backgroundColor: "white",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  priceBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dbeafe",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  priceIconWrapper: {
    marginRight: 12,
  },
  priceLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1976d2",
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  detailItem: {
    flex: 1,
    minWidth: "45%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  detailIconText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2e7d32",
  },
  detailText: {
    fontSize: 13,
    color: "#333",
    flex: 1,
  },
  formSection: {
    backgroundColor: "#fafafa",
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  required: {
    color: "#ef4444",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    overflow: "hidden",
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1f2937",
  },
  formattedPrice: {
    fontSize: 12,
    color: "#0ea5e9",
    fontWeight: "500",
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  charCount: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 4,
  },
  alertBox: {
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fcd34d",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#b45309",
    marginLeft: 8,
  },
  alertText: {
    fontSize: 12,
    color: "#b45309",
    marginBottom: 4,
    lineHeight: 18,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1976d2",
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
