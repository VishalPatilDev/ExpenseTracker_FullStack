package com.pjsofttech.expensetracker.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Core expense entity.
 *
 * paymentStatus is always recalculated from installment payments —
 * never set manually except for ONE_TIME expenses.
 *
 * For ONE_TIME: paymentStatus = COMPLETE immediately on creation.
 * For INSTALLMENT: paymentStatus starts PENDING, updated after each payment.
 */
@Entity
@Table(name = "expenses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "contact_id", nullable = false)
    private Contact contact;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "bank_id", nullable = false)
    private Bank bank;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private TransactionType type;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "particular")
    private String particular;

    /** Base amount before GST/TDS. */
    @Column(name = "amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "gst_percentage", precision = 5, scale = 2)
    private BigDecimal gstPercentage;

    @Column(name = "gst_number")
    private String gstNumber;

    @Column(name = "tds_percentage", precision = 5, scale = 2)
    private BigDecimal tdsPercentage;

    /**
     * Backend-calculated total: amount + GST - TDS.
     * Stored for fast reads. Always recalculated on create/update.
     */
    @Column(name = "total", nullable = false, precision = 15, scale = 2)
    private BigDecimal total;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_type", nullable = false)
    private PaymentType paymentType;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(name = "remark")
    private String remark;

    @OneToMany(mappedBy = "expense", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ExpenseInstallment> installments = new ArrayList<>();
}
//package com.pjsofttech.expensetracker.model;
//
//import jakarta.persistence.*;
//import lombok.AllArgsConstructor;
//import lombok.Builder;
//import lombok.Data;
//import lombok.NoArgsConstructor;
//
//
//import java.time.LocalDate;
//import java.time.LocalDateTime;
//import java.util.ArrayList;
//import java.util.List;
//
//@Entity
//@Table(name = "expenses")
//@Data
//@AllArgsConstructor
//@NoArgsConstructor
//@Builder
//public class Expense {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    // The logged-in user
//    @ManyToOne(fetch = FetchType.LAZY, optional = false)
//    @JoinColumn(name = "owner_id")
//    private User owner;
//
//    // Person involved in this transaction
//    @ManyToOne(fetch = FetchType.LAZY, optional = false)
//    @JoinColumn(name = "contact_id")
//    private Contact contact;
//
//    @ManyToOne(fetch = FetchType.LAZY, optional = false)
//    @JoinColumn(name = "bank_id")
//    private Bank bank;
//
//
//    @Enumerated(EnumType.STRING)
//    private TransactionType type;
//
//    private LocalDate date;
//
//    @ManyToOne(fetch = FetchType.LAZY,optional = false)
//    @JoinColumn(name = "category_id",nullable = false)
//    private Category category;
//
//    private String particular;
//
//    private Long amount;
//
//    private Long gstPercentage;
//
//    private String gstNumber;
//
//    private Long tdsPercentage;
//
//    private Long total;
//
//    @Enumerated(EnumType.STRING)
//    @Column(name = "payment_type")
//    private PaymentType paymentType;
//    @Enumerated(EnumType.STRING)
//    @Column(name = "payment_status")
//    private PaymentStatus paymentStatus;
//
////    @OneToMany(
////            mappedBy = "expense",
////            cascade = CascadeType.ALL,
////            orphanRemoval = true
////    )
////    private List<ExpenseInstallment> payments = new ArrayList<>();
//    private Integer numberOfInstallments;
//    @Enumerated(EnumType.STRING)
//    private PaymentMethod paymentMethod;
//
//    private String remark;
//}
//
