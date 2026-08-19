package com.pjsofttech.expensetracker.controller;

import com.pjsofttech.expensetracker.dto.*;
import com.pjsofttech.expensetracker.model.*;
import com.pjsofttech.expensetracker.service.ExpenseService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/pjsofttech/expense")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    // ── Create expense (with optional installment schedule) ──────────────────
    @PostMapping
    public ResponseEntity<ExpenseResponseDto> addExpense(
            @RequestBody @Valid ExpenseRequestDto request,
            @AuthenticationPrincipal User loggedInUser) {

        return ResponseEntity.ok(expenseService.addExpense(request, loggedInUser));
    }

    // ── Get all expenses for logged-in user ───────────────────────────────────
    @GetMapping("/expenses")
    public ResponseEntity<List<ExpenseResponseDto>> getAllExpenses(
            @AuthenticationPrincipal User loggedInUser) {

        return ResponseEntity.ok(expenseService.getAllExpenses(loggedInUser));
    }

    // ── Add payment against a SPECIFIC installment ────────────────────────────
    //
    // REST design rationale:
    //   POST /expense/installment/{installmentId}/payment
    //
    //   - The installment already holds the expense reference, so expenseId
    //     in the URL would be redundant.
    //   - The service validates the installment belongs to a valid expense.
    //   - This URL clearly expresses: "record a payment against installment X"
    //
    @PostMapping("/installment/{installmentId}/payment")
    public ResponseEntity<ExpenseResponseDto> addInstallmentPayment(
            @PathVariable Long installmentId,
            @RequestBody @Valid InstallmentPaymentRequestDto request) {

        return ResponseEntity.ok(expenseService.addInstallmentPayment(installmentId, request));
    }

    // ── Filters ───────────────────────────────────────────────────────────────

    @GetMapping("/by-category/{id}")
    public ResponseEntity<List<ExpenseResponseDto>> getByCategory(@PathVariable Long id) {
        return ResponseEntity.ok(expenseService.getAllExpensesByCategory(id));
    }

    @GetMapping("/by-contact/{id}")
    public ResponseEntity<List<ExpenseResponseDto>> getByContact(@PathVariable Long id) {
        return ResponseEntity.ok(expenseService.getAllExpensesByContact(id));
    }

    @GetMapping("/by-payment-type")
    public ResponseEntity<List<ExpenseResponseDto>> getByPaymentType(
            @RequestParam PaymentType type) {
        return ResponseEntity.ok(expenseService.getAllExpensesByPaymentType(type));
    }

    @GetMapping("/by-payment-method")
    public ResponseEntity<List<ExpenseResponseDto>> getByPaymentMethod(
            @RequestParam PaymentMethod method) {
        return ResponseEntity.ok(expenseService.getAllExpensesByPaymentMethod(method));
    }

    @GetMapping("/by-type")
    public ResponseEntity<List<ExpenseResponseDto>> getByTransactionType(
            @RequestParam TransactionType type) {
        return ResponseEntity.ok(expenseService.getAllExpensesByTransactionType(type));
    }

    @GetMapping("/by-date")
    public ResponseEntity<List<ExpenseResponseDto>> getByDate(
            @RequestParam LocalDate date) {
        return ResponseEntity.ok(expenseService.getAllExpensesByDate(date));
    }

    // ── Global error handler (add to your @ControllerAdvice or here) ─────────
    //
    // @ExceptionHandler(IllegalArgumentException.class)
    // public ResponseEntity<Map<String, String>> handleValidation(IllegalArgumentException e) {
    //     return ResponseEntity.badRequest()
    //         .body(Map.of("error", e.getMessage()));
    // }
}
//package com.pjsofttech.expensetracker.controller;
//
//import com.pjsofttech.expensetracker.dto.ExpenseRequestDto;
//import com.pjsofttech.expensetracker.dto.ExpenseResponseDto;
//import com.pjsofttech.expensetracker.dto.InstallmentRequestDto;
//import com.pjsofttech.expensetracker.model.*;
//import com.pjsofttech.expensetracker.repository.UserRepository;
//import com.pjsofttech.expensetracker.service.ExpenseService;
//import jakarta.validation.Valid;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.core.Authentication;
//import org.springframework.web.bind.annotation.*;
//
//import java.time.LocalDate;
//
//@RestController
//@RequestMapping("/pjsofttech/expense")
//public class ExpenseController {
//
//    @Autowired
//    private ExpenseService expenseService;
//
//    @Autowired
//    private UserRepository userRepository;
//
//    // --------------------------------
//    // CREATE EXPENSE (with optional schedule)
//    // --------------------------------
//
//    @PostMapping
//    public ResponseEntity<?> addExpense(
//            @Valid @RequestBody ExpenseRequestDto expenseRequestDto,
//            Authentication authentication
//    ) {
//        User loggedInUser = getLoggedInUser(authentication);
//        return ResponseEntity.ok(expenseService.addExpense(expenseRequestDto, loggedInUser));
//    }
//
//    // --------------------------------
//    // RECORD PAYMENT AGAINST AN INSTALLMENT
//    // Body: { installmentId, amount, date, remark }
//    // --------------------------------
//
//    @PostMapping("/{expenseId}/installment")
//    public ResponseEntity<ExpenseResponseDto> addInstallment(
//            @PathVariable Long expenseId,
//            @RequestBody InstallmentRequestDto request
//    ) {
//        return ResponseEntity.ok(expenseService.addInstallment(expenseId, request));
//    }
//
//    // --------------------------------
//    // LIST
//    // --------------------------------
//
//    @GetMapping("/expenses")
//    public ResponseEntity<?> getAllExpenses(Authentication authentication) {
//        User loggedInUser = getLoggedInUser(authentication);
//        return ResponseEntity.ok(expenseService.getAllExpenses(loggedInUser));
//    }
//
//    @GetMapping("/byCategory/{id}")
//    public ResponseEntity<?> getAllExpensesByCategory(@PathVariable Long id) {
//        return ResponseEntity.ok(expenseService.getAllExpensesByCategory(id));
//    }
//
//    @GetMapping("/byContact/{id}")
//    public ResponseEntity<?> getAllExpensesByContact(@PathVariable Long id) {
//        return ResponseEntity.ok(expenseService.getAllExpensesByContact(id));
//    }
//
//    @GetMapping("/byPaymentStatus")
//    public ResponseEntity<?> getAllExpensesByPaymentStatus(@RequestParam PaymentType paymentType) {
//        return ResponseEntity.ok(expenseService.getAllExpensesByPaymentType(paymentType));
//    }
//
//    @GetMapping("/byPaymentMethod")
//    public ResponseEntity<?> getAllExpensesByPaymentMethod(@RequestParam PaymentMethod paymentMethod) {
//        return ResponseEntity.ok(expenseService.getAllExpensesByPaymentMethod(paymentMethod));
//    }
//
//    @GetMapping("/byDate")
//    public ResponseEntity<?> getAllExpensesByDate(@RequestParam LocalDate date) {
//        return ResponseEntity.ok(expenseService.getAllExpensesByDate(date));
//    }
//
//    @GetMapping("/byTransactionType")
//    public ResponseEntity<?> getAllExpensesByTransactionType(@RequestParam TransactionType transactionType) {
//        return ResponseEntity.ok(expenseService.getAllExpensesByTransactionType(transactionType));
//    }
//
//    // --------------------------------
//    // HELPER
//    // --------------------------------
//
//    private User getLoggedInUser(Authentication authentication) {
//        String email = authentication.getName();
//        return userRepository.findByEmail(email)
//                .orElseThrow(() -> new RuntimeException("User not found"));
//    }
//}