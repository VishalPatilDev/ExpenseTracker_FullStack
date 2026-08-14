package com.pjsofttech.expensetracker.dto;

import com.pjsofttech.expensetracker.model.*;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ExpenseRequestDto {
    private Long contactId;
    private TransactionType type;
    private LocalDate date;
    private Long categoryId;
    private String particular;
    private Long amount;
    private Long gstPercentage;
    private String gstNumber;
    private Long tdsPercentage;
    private Long total;
    private PaymentType paymentType; //COMPLETE, INSTALLMENT
//    private PaymentStatus paymentStatus; //PENDING, PARTIAL, COMPLETE //not needed on frontend
//    private PaymentMethod paymentMethod;
    private InstallmentRequestDto installmentRequestDto;
    private String remark;
}
