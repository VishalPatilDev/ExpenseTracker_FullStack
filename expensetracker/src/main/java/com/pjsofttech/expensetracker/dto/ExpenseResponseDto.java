package com.pjsofttech.expensetracker.dto;

import com.pjsofttech.expensetracker.model.*;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class ExpenseResponseDto {
    private Long id;
    private Integer index;
    private LocalDate date;
    private ContactResponseDto contact;
    private CategoryResponseDto category;
    private String particular;
    private Long amount;
    private Long gstPercentage;
    private Long gstAmount;
    private String gstNumber;
    private Long tdsPercentage;
    private Long total;
    private Long paid;
    private Long pending;
    private TransactionType type; //INCOME,EXPENSE
    private PaymentType paymentType; //COMPLETE,INSTALLMENT
    private PaymentStatus paymentStatus; //PENDING, PARTIAL, COMPLETE
//    private PaymentMethod paymentMethod;
    private String remark;
}
