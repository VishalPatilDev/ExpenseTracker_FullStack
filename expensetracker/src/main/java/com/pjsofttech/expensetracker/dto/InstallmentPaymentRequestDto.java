package com.pjsofttech.expensetracker.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Represents a PAYMENT made against a specific existing installment.
 * Sent to: POST /expense/installment/{installmentId}/payment
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InstallmentPaymentRequestDto {

    @NotNull(message = "Payment amount is required")
    @DecimalMin(value = "0.01", message = "Payment amount must be greater than zero")
    private BigDecimal amount;

    @NotNull(message = "Payment date is required")
    private LocalDate date;

    private String remark;
}
//package com.pjsofttech.expensetracker.dto;
//
//import lombok.Data;
//
//import java.time.LocalDate;
//
//@Data
//public class InstallmentPaymentRequestDto {
//
//    private Long installmentId;
//
//    private Long amount;
//
//    private LocalDate paymentDate;
//
//    private String remark;
//}
